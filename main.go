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

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
)

type Link struct {
	id     string
	url    string
	short  string
	clicks int
}

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
		id VARCHAR(255) PRIMARY KEY,
	        url TEXT NOT NULL,
	        clicks INTEGER NOT NULL DEFAULT 0,
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
	e.POST("/submit", SubmitHandler)
	e.GET("/health", HealthHandler)

	e.Logger.Fatal(e.Start(":8080"))
	fmt.Println("Server started on :8080")
}

func RedirectHandler(c echo.Context) error {
	id := c.Param("id")
	fmt.Printf("Redirect requested for id: '%s'\n", id)

	var url string
	err := db.QueryRow("SELECT url FROM links WHERE id = ?", id).Scan(&url)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.String(http.StatusNotFound, "Link not found")
		}
		return c.String(http.StatusInternalServerError, fmt.Sprintf("DB query failed: %v", err))
	}

	res, err := db.Exec("UPDATE links SET clicks = clicks + 1 WHERE id = ?", id)
	if err != nil {

		fmt.Printf("Failed to update clicks for id %s: %v\n", id, err)
	} else {
		rowsAffected, _ := res.RowsAffected()
		fmt.Printf("UPDATE result: %d rows affected for id %s\n", rowsAffected, id)
	}

	if !strings.Contains(url, "://") {
		url = "http://" + url
	}

	return c.Redirect(http.StatusFound, url)
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
	url := strings.TrimSpace(c.FormValue("url"))
	short := strings.TrimSpace(c.FormValue("short"))
	if url == "" {
		return c.String(http.StatusBadRequest, "URL is required")
	}
	if !(len(url) >= 4 && (url[:4] == "http" || url[:5] == "https")) {
		url = "http://" + url
	}
	if !isUrlValid(url) {
		return c.JSON(http.StatusBadRequest, "Invalid URL")
	}
	var id string
	if short != "" {
		if !shortURLPattern.MatchString(short) {
			return c.String(http.StatusBadRequest, "Short URL must be 3-20 alphanumeric characters")
		}
		var exists int
		err := db.QueryRow("SELECT COUNT(1) FROM links WHERE id = ?", short).Scan(&exists)
		if err != nil {
			return c.String(http.StatusInternalServerError, "Error checking short URL")
		}
		if exists > 0 {
			return c.String(http.StatusConflict, "Short URL already exists")
		}
		id = short
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

	fmt.Println("About to insert into DB")

	_, err := db.Exec(
		`INSERT INTO links (id, url, clicks) VALUES (?, ?, ?)`,
		id, url, 0,
	)
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE") {
			return c.String(http.StatusConflict, "Short URL already exists (DB)")
		}
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error inserting link into database: %v", err))
	}
	fmt.Println("Inserted into DB successfully")

	return c.Redirect(http.StatusSeeOther, "/")
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
	return c.String(http.StatusOK, "OK")
}
