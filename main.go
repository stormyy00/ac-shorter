package main

import (
	"database/sql"
	"flag"
	"fmt"
	"log"
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
	"github.com/stormyy00/ac-shorter.git/auth"
	"github.com/stormyy00/ac-shorter.git/model"
	_ "github.com/tursodatabase/libsql-client-go/libsql"
)

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
						id INTEGER PRIMARY KEY AUTOINCREMENT,
						user_id TEXT NOT NULL REFERENCES user(id),
						link_id    TEXT,
						original   TEXT NOT NULL,
						shorten_url TEXT,
						slug_url 	TEXT UNIQUE,
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
	e.GET("/statistics", StatisticsHandler)
	e.GET("/auth/me", verifyAuthHandler)
	e.GET("/auth/verify", verifyAuthHandler)

	e.Logger.Fatal(e.Start(":8080"))
	fmt.Println("Server started on :8080")
}

type AuthResponse struct {
	Status  string      `json:"status"`
	Message string      `json:"message"`
	User    *model.User `json:"user,omitempty"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}

func verifyAuthHandler(c echo.Context) error {
	// Get user from request
	user, err := auth.UserFromRequestHandler(c)
	if err != nil {
		log.Printf("failed to get user: %v", err)

		return c.JSON(http.StatusUnauthorized, ErrorResponse{
			Error: "Authentication failed",
		})
	}
	c.Response().Header().Set("Content-Type", "application/json")
	return c.JSON(http.StatusOK, AuthResponse{
		Status:  "success",
		Message: "Token is valid",
		User:    &user,
	})
}

func RedirectHandler(c echo.Context) error {
	slug := c.Param("id")
	fmt.Printf("Redirect requested for slug: '%s'\n", slug)

	var original string
	err := db.QueryRow("SELECT original FROM links WHERE slug_url = ?", slug).Scan(&original)
	if err != nil {
		if err == sql.ErrNoRows {
			fmt.Printf("Link not found for slug: %s\n", slug)
			return c.String(http.StatusNotFound, "Link not found")
		}
		fmt.Printf("DB query failed: %v\n", err)
		return c.String(http.StatusInternalServerError, fmt.Sprintf("DB query failed: %v", err))
	}

	res, err := db.Exec("UPDATE links SET clicks = clicks + 1 WHERE slug_url = ?", slug)
	if err != nil {
		fmt.Printf("Failed to update clicks for slug %s: %v\n", slug, err)
	} else {
		rowsAffected, _ := res.RowsAffected()
		fmt.Printf("UPDATE result: %d rows affected for slug %s\n", rowsAffected, slug)
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

	rows, err := db.Query("SELECT id, original, shorten_url, clicks FROM links")
	if err != nil {
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error querying links: %v", err))
	}
	defer rows.Close()

	for rows.Next() {
		var id, original, shortenUrl string
		var clicks int
		if err := rows.Scan(&id, &original, &shortenUrl, &clicks); err == nil {
			html += fmt.Sprintf(`<li><a href="/%s">%s</a> &rarr; %s <span>(%d clicks)</span></li>`, id, id, original, clicks)
		}
	}
	html += `</ul>`
	fmt.Println("Finished IndexHandler")
	return c.HTML(http.StatusOK, html)
}

func SubmitHandler(c echo.Context) error {

	user, err := auth.UserFromRequestHandler(c)

	if err != nil {
		return c.String(http.StatusUnauthorized, "Unauthorized")
	}

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

	var slug string
	if customShort != "" {
		if !shortURLPattern.MatchString(customShort) {
			return c.String(http.StatusBadRequest, "Short URL must be 3-20 alphanumeric characters")
		}
		var exists int
		err := db.QueryRow("SELECT COUNT(1) FROM links WHERE slug_url = ?", customShort).Scan(&exists)
		if err != nil {
			return c.String(http.StatusInternalServerError, "Error checking short URL")
		}
		if exists > 0 {
			return c.String(http.StatusConflict, "Short URL already exists")
		}
		slug = customShort
	} else {
		for {
			candidate := generateRandString(6)
			var exists int
			err := db.QueryRow("SELECT COUNT(1) FROM links WHERE slug_url = ?", candidate).Scan(&exists)
			if err != nil {
				return c.String(http.StatusInternalServerError, "Error checking generated URL")
			}
			if exists == 0 {
				slug = candidate
				break
			}
		}
	}

	shortenUrl := fmt.Sprintf("https://%s/%s", c.Request().Host, slug)
	fmt.Println("About to insert into DB")

	linkId := uuid.New().String()

	_, err = db.Exec(
		`INSERT INTO links (user_id, link_id, original, shorten_url, slug_url, clicks) VALUES (?, ?, ?, ?, ?, ?)`,
		user.ID, linkId, original, shortenUrl, slug, 0,
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
	user, err := auth.UserFromRequestHandler(c)
	if err != nil {
		return c.String(http.StatusUnauthorized, "Unauthorized")
	}

	linkType := c.Param("type")
	var rows *sql.Rows

	if linkType == "" {
		rows, err = db.Query("SELECT id, link_id, original, shorten_url, slug_url, clicks, created_at FROM links WHERE user_id = ?", user.ID)
	} else if linkType == "recent" {
		rows, err = db.Query("SELECT id, link_id, original, shorten_url, slug_url, clicks, created_at FROM links WHERE user_id = ? ORDER BY created_at ASC LIMIT 4", user.ID)
	} else {
		return c.String(http.StatusBadRequest, "Invalid type parameter")
	}

	if err != nil {
		fmt.Println("DB Query Error:", err)
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error querying links: %v", err))
	}
	defer rows.Close()

	if rows == nil {
		return c.JSON(http.StatusOK, []model.Link{})
	}

	var links []model.Link
	for rows.Next() {
		var id int64
		var linkid, original, shortenUrl, slugUrl string
		var clicks int
		var createdAt time.Time
		if err := rows.Scan(&id, &linkid, &original, &shortenUrl, &slugUrl, &clicks, &createdAt); err != nil {
			fmt.Println("Row Scan Error:", err)
			return c.String(http.StatusInternalServerError, fmt.Sprintf("Error scanning link: %v", err))
		}
		links = append(links, model.Link{ID: id, LinkID: linkid, Original: original, ShortenUrl: shortenUrl, SlugUrl: slugUrl, Clicks: clicks, CreatedAt: createdAt})
	}
	return c.JSON(http.StatusOK, links)
}

func DeleteHandler(c echo.Context) error {
	user, err := auth.UserFromRequestHandler(c)
	if err != nil {
		return c.String(http.StatusUnauthorized, "Unauthorized")
	}

	id := c.Param("id")
	res, err := db.Exec("DELETE FROM links WHERE id = ? AND user_id = ?", id, user.ID)
	if err != nil {
		return c.String(http.StatusInternalServerError, "Failed to delete link")
	}
	rowsAffected, _ := res.RowsAffected()
	if rowsAffected == 0 {
		return c.String(http.StatusNotFound, "Link not found or unauthorized")
	}
	return c.NoContent(http.StatusNoContent)
}

func StatisticsHandler(c echo.Context) error {
	user, err := auth.UserFromRequestHandler(c)
	if err != nil {
		return c.String(http.StatusUnauthorized, "Unauthorized")
	}
	var allLinks []model.Statistics
	var perLinks []model.Statistics

	// total click per month all links
	row, err := db.Query("SELECT strftime('%Y-%m', created_at) AS month, SUM(clicks) AS total_clicks FROM links WHERE user_id = ? GROUP BY month ORDER BY month DESC", user.ID)

	if err != nil {
		fmt.Println("DB Query Error:", err)
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error querying links: %v", err))
	}
	defer row.Close()

	for row.Next() {
		var month string
		var totalClicks int
		if err := row.Scan(&month, &totalClicks); err != nil {
			fmt.Println("Row Scan Error:", err)
			return c.String(http.StatusInternalServerError, fmt.Sprintf("Error scanning link: %v", err))
		}
		allLinks = append(allLinks, model.Statistics{
			Month:       month,
			TotalClicks: totalClicks,
		})
	}

	// total click per month per link
	row2, err := db.Query("SELECT strftime('%Y-%m', created_at) AS month, slug_url, SUM(clicks) AS total_clicks, created_at FROM links WHERE user_id = ? GROUP BY month, slug_url ORDER BY month DESC", user.ID)

	if err != nil {
		fmt.Println("DB Query Error:", err)
		return c.String(http.StatusInternalServerError, fmt.Sprintf("Error querying links: %v", err))
	}
	defer row2.Close()

	for row2.Next() {
		var month, slugUrl string
		var totalClicks int
		var createdAt time.Time
		if err := row2.Scan(&month, &slugUrl, &totalClicks, &createdAt); err != nil {
			fmt.Println("Row Scan Error:", err)
			return c.String(http.StatusInternalServerError, fmt.Sprintf("Error scanning link: %v", err))
		}
		perLinks = append(perLinks, model.Statistics{
			Month:       month,
			SlugUrl:     slugUrl,
			TotalClicks: totalClicks,
			CreatedAt:   createdAt,
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"all_links":   allLinks,
		"per_links":   perLinks,
		"total_links": len(allLinks) + len(perLinks),
	})
}
