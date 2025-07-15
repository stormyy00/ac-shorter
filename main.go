package main

import (
	"database/sql"
	"flag"
	"fmt"
	"math/rand"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/stormyy00/ac-shorter.git/model"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
)

// type Link struct {
// 	Id     string `json:"id"`
// 	Url    string `json:"url"`
// 	Short  string `json:"short"`
// 	Clicks int    `json:"clicks"`
// }

var (
	charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

	shortURLPattern = regexp.MustCompile(`^[a-zA-Z0-9]+$`)
	baseurl         *string

	db *sql.DB
)

func init() {
	godotenv.Load()
	baseurl = flag.String("url", "127.0.0.1:8080", "The URL (domain) that the server is running on")
	flag.Parse()
	url := os.Getenv("TURSO_DATABASE_URL")
	token := os.Getenv("TURSO_AUTH_TOKEN")

	if url == "" {
		panic("TURSO_DATABASE_URL not set")
	}
	if token == "" {
		panic("TURSO_AUTH_TOKEN not set")
	}

	connector := "?"
	if strings.Contains(url, "?") {
		connector = "&"
	}
	var err error
	db, err = sql.Open("libsql", fmt.Sprintf("%s%sauthToken=%s", url, connector, token)) // Fixed
	if err != nil {
		panic(fmt.Sprintf("Failed to connect to database: %v", err))
	}
	fmt.Println("Connected to database successfully")

	_, err = db.Exec(`CREATE TABLE IF NOT EXISTS links (
						id         TEXT PRIMARY KEY,
						link_id    TEXT,
						original   TEXT NOT NULL,
						shorten_url TEXT,
						clicks     INTEGER NOT NULL DEFAULT 0,
						created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
						);`)

	// if err := loadIntoMemory(); err != nil {
	// 	panic(fmt.Sprintf("Failed to load links into memory: %v", err))
	// }
	// fmt.Println("Links loaded into memory successfully")

	if err != nil {
		panic(fmt.Sprintf("Failed to create table: %v", err))
	}
	fmt.Println("Table created or already exists")

}

func main() {
	rand.Seed(time.Now().UnixNano())
	fmt.Println("Hello, World!")

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.Secure())

	e.GET("/", IndexHandler)
	e.GET("/:id", RedirectHandler)
	e.GET("/:id/", RedirectHandler)
	e.DELETE("/links/:id", DeleteHandler)
	e.DELETE("/links/:id/", DeleteHandler)
	e.POST("/submit", SubmitHandler)
	e.GET("/health", HealthHandler)
	e.GET("/links", FetchHandler)

	e.Logger.Fatal(e.Start(":8080"))
	fmt.Println("Server started on :8080")
}

func RedirectHandler(c echo.Context) error {
	id := c.Param("id")
	fmt.Printf("Redirect requested for id: '%s'\n", id)

	var original string
	err := db.QueryRow("SELECT original FROM links WHERE id = ?", id).Scan(&original)
	if err != nil {
		if err == sql.ErrNoRows {
			fmt.Printf("Link not found for id: %s\n", id)
			return c.String(http.StatusNotFound, "Link not found")
		}
		fmt.Printf("DB query failed: %v\n", err)
		return c.String(http.StatusInternalServerError, fmt.Sprintf("DB query failed: %v", err))
	}

	res, err := db.Exec("UPDATE links SET clicks = clicks + 1 WHERE id = ?", id)
	if err != nil {
		fmt.Printf("Failed to update clicks for id %s: %v\n", id, err)
	} else {
		rowsAffected, _ := res.RowsAffected()
		fmt.Printf("UPDATE result: %d rows affected for id %s\n", rowsAffected, id)
	}

	if !strings.Contains(original, "://") {
		original = "http://" + original
	}

	return c.Redirect(http.StatusFound, original)
}

func generateRandString(length int) string {
	randStr := rand.New(rand.NewSource(time.Now().UnixNano()))

	var res []byte
	for i := 0; i < length; i++ {
		index := randStr.Intn(len(charset))
		res = append(res, charset[index])
	}
	return string(res)
}

func IndexHandler(c echo.Context) error {
	fmt.Println("Starting IndexHandler")
	html := `<h1>Welcome to the URL Shortener</h1>
<form action="/submit" method="POST">
    <label for="url">Website URL:</label>
    <input type="text" id="url" name="url">
    <label for="short">Custom Short URL (optional):</label>
    <input type="text" id="short" name="short">
    <input type="submit" value="Submit">
</form>
<h2>Existing Links</h2>
<ul>`

	rows, err := db.Query("SELECT id, url, clicks FROM links")
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error querying links: %v", err))
	}
	defer rows.Close()

	for rows.Next() {
		var id, url string
		var clicks int
		if err := rows.Scan(&id, &url, &clicks); err == nil {
			html += fmt.Sprintf(`<li><a href="/%s">%s</a> &rarr; %s <span>(%d clicks)</span></li>`, id, id, url, clicks)
		}
	}
	html += `</ul>`
	fmt.Println("Finished IndexHandler")
	return c.HTML(http.StatusOK, html)
}

func SubmitHandler(c echo.Context) error {
	original := strings.TrimSpace(c.FormValue("url"))
	customShort := strings.TrimSpace(c.FormValue("short"))
	fmt.Printf("Received original URL: '%s' and custom short: '%s'\n", original, customShort)
	if original == "" {
		return c.String(http.StatusBadRequest, "URL is required")
	}
	if !(len(original) >= 4 && (original[:4] == "http" || original[:5] == "https")) {
		original = "http://" + original
	}
	if !isUrlValid(original) {
		return c.JSON(http.StatusBadRequest, "Invalid URL")
	}

	var id string
	if customShort != "" {
		if !shortURLPattern.MatchString(customShort) {
			return c.String(http.StatusBadRequest, "Short URL must be 3-20 alphanumeric characters")
		}
		var exists int
		err := db.QueryRow("SELECT COUNT(1) FROM links WHERE id = ?", customShort).Scan(&exists)
		if err != nil {
			return c.String(http.StatusInternalServerError, "Error checking short URL")
		}
		if exists > 0 {
			return c.String(http.StatusConflict, "Short URL already exists")
		}
		id = customShort
	} else {
		for {
			candidate := generateRandString(6)
			var exists int
			err := db.QueryRow("SELECT COUNT(1) FROM links WHERE id = ?", candidate).Scan(&exists)
			if err != nil {
				return c.String(http.StatusInternalServerError, "Error checking generated URL")
			}
			if exists == 0 {
				id = candidate
				break
			}
		}
	}

	shortenUrl := fmt.Sprintf("https://%s/%s", c.Request().Host, id)

	fmt.Println("About to insert into DB")

	linkId := uuid.New().String()

	_, err := db.Exec(
		`INSERT INTO links (id, link_id, original, shorten_url, clicks) VALUES (?, ?, ?, ?, ?)`,
		id, linkId, original, shortenUrl, 0,
	)
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE") {
			return c.String(http.StatusConflict, "Short URL already exists (DB)")
		}
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error inserting link into database: %v", err))
	}
	fmt.Println("Inserted into DB successfully")

	return c.JSON(http.StatusCreated, map[string]string{"status": "ok"})
}

func isUrlValid(urlStr string) bool {
	if !strings.HasPrefix(urlStr, "http://") && !strings.HasPrefix(urlStr, "https://") {
		return false
	}
	parsedUrl, err := url.ParseRequestURI(urlStr)
	if err != nil {
		return false
	}
	if parsedUrl.Scheme == "" || parsedUrl.Host == "" {
		return false
	}
	domainregex := `^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$`
	matched, err := regexp.MatchString(domainregex, parsedUrl.Host)
	if err != nil {
		return false
	}
	return matched
}

// func loadIntoMemory() error {
// 	rows, error := db.Query("SELECT id, url, clicks FROM links")

// 	if error != nil {
// 		return fmt.Errorf("failed to query links: %v", error)
// 	}
// 	defer rows.Close()

// 	linkMapMutex.Lock()
// 	defer linkMapMutex.Unlock()

// 	for rows.Next() {
// 		var id, url string
// 		var clicks int
// 		if err := rows.Scan(&id, &url, &clicks); err != nil {
// 			return fmt.Errorf("failed to scan row: %v", err)
// 		}
// 		linkMap[id] = Link{id: id, url: url, clicks: clicks}
// 	}

// 	return nil
// }

func HealthHandler(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{"status": "OK"})
}

func FetchHandler(c echo.Context) error {
	rows, err := db.Query("SELECT id, link_id, original, shorten_url, clicks FROM links")
	if err != nil {
		fmt.Println("DB Query Error:", err) // Add this line
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error querying links: %v", err))
	}
	defer rows.Close()

	var links []model.Link
	for rows.Next() {
		var id, url, original, shortenUrl string
		var clicks int
		if err := rows.Scan(&id, &url, &original, &shortenUrl, &clicks); err != nil {
			fmt.Println("Row Scan Error:", err)
			return c.String(http.StatusInternalServerError, fmt.Sprintf("Error scanning link: %v", err))
		}
		links = append(links, model.Link{ID: id, LinkID: shortenUrl, Original: original, ShortenUrl: shortenUrl, Clicks: clicks})
	}
	return c.JSON(http.StatusOK, links)
}

func DeleteHandler(c echo.Context) error {
	id := c.Param("id")
	_, err := db.Exec("DELETE FROM links WHERE id = ?", id)
	if err != nil {
		return c.String(http.StatusInternalServerError, "Failed to delete link")
	}
	return c.NoContent(http.StatusNoContent)
}
