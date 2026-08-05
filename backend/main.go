package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"runtime"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/time/rate"
)

// --- Struct Data ---
type Record struct {
	ID        int     `json:"id"`
	SiteName  string  `json:"site_name"`
	Revenue   float64 `json:"revenue"`
	User      string  `json:"user"`
	Payload   string  `json:"payload"`
	CreatedAt string  `json:"created_at"`
}

type Stats struct {
	TotalRecords  int     `json:"total_records"`
	TotalRevenue  float64 `json:"total_revenue"`
	AllocMemoryMB float64 `json:"alloc_memory_mb"`
	SysMemoryMB   float64 `json:"sys_memory_mb"`
	NumGoroutines int     `json:"num_goroutines"`
	Uptime        string  `json:"uptime"`
}

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// --- Global Variables & In-Memory Store ---
var (
	jwtSecret   = []byte("secret_key_dashboard_2026")
	records     = []Record{}
	nextID      = 1
	mutex       sync.RWMutex
	startTime   = time.Now()
	rateLimiter = rate.NewLimiter(rate.Limit(10), 30) // 10 req/s, burst 30
)

func init() {
	// Seed data awal
	records = append(records, Record{
		ID:        nextID,
		SiteName:  "alpha-hub.io",
		Revenue:   5432.10,
		User:      "alice_dev",
		Payload:   `{"status":"active","region":"us-east-1","ping_ms":25,"views":12500}`,
		CreatedAt: time.Now().Format("2006-01-02 15:04:05"),
	})
	nextID++
}

func main() {
	mux := http.NewServeMux()

	// Public Endpoints
	mux.HandleFunc("/", handleHealth)
	mux.HandleFunc("/api/login", handleLogin)

	// Protected Endpoints (Membutuhkan JWT)
	mux.HandleFunc("/api/records", jwtMiddleware(handleRecords))
	mux.HandleFunc("/api/records/", jwtMiddleware(handleRecordByID))
	mux.HandleFunc("/api/seed", jwtMiddleware(handleSeed))
	mux.HandleFunc("/api/stats", jwtMiddleware(handleStats))

	// Global Middleware: Rate Limiter & Max Body Size (1MB)
	handler := rateLimitMiddleware(maxBytesMiddleware(mux))

	fmt.Println("Backend Go REST API berjalan di http://localhost:8080")
	if err := http.ListenAndServe(":8080", handler); err != nil {
		fmt.Printf("Gagal menjalankan server: %v\n", err)
	}
}

func handleRecords(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		handleGetRecords(w, r)
	case http.MethodPost:
		handleCreateRecord(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func handleRecordByID(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodDelete:
		handleDeleteRecord(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

// --- Middlewares ---

func rateLimitMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !rateLimiter.Allow() {
			http.Error(w, "429 Too Many Requests - Rate Limit Exceeded", http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func maxBytesMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r.Body = http.MaxBytesReader(w, r.Body, 1<<20) // Limit 1MB
		next.ServeHTTP(w, r)
	})
}

func jwtMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "Unauthorized: Token tidak ditemukan", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Unauthorized: Token tidak valid atau kedaluwarsa", http.StatusUnauthorized)
			return
		}

		next(w, r)
	}
}

// --- Handlers ---

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK - API Health Check Pass"))
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Bad Request", http.StatusBadRequest)
		return
	}

	// Kredensial default: user / pass
	if req.Username != "user" || req.Password != "pass" {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	// Generate JWT Token (Berlaku 24 Jam)
	claims := jwt.MapClaims{
		"username": req.Username,
		"exp":      time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, err := token.SignedString(jwtSecret)
	if err != nil {
		http.Error(w, "Failed to generate token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"token": tokenStr})
}

func handleGetRecords(w http.ResponseWriter, r *http.Request) {
	mutex.RLock()
	defer mutex.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(records)
}

func handleCreateRecord(w http.ResponseWriter, r *http.Request) {
	var req Record
	_ = json.NewDecoder(r.Body).Decode(&req)

	mutex.Lock()
	defer mutex.Unlock()

	// Jika body kosong, generate dummy record
	if req.SiteName == "" && req.User == "" && req.Revenue == 0 {
		req.SiteName = fmt.Sprintf("site-%d.io", nextID)
		req.Revenue = float64(100 * nextID)
		req.User = fmt.Sprintf("user_%d", nextID)
		req.Payload = `{"status":"active"}`
	} else {
		// Validasi input
		if len(req.SiteName) > 100 || req.Revenue < 0 || req.Revenue > 1000000000 || len(req.User) > 50 {
			http.Error(w, "Validation failed", http.StatusBadRequest)
			return
		}
	}

	req.ID = nextID
	req.CreatedAt = time.Now().Format("2006-01-02 15:04:05")
	nextID++

	records = append(records, req)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(req)
}

func handleDeleteRecord(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/api/records/")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		http.Error(w, "Invalid ID", http.StatusBadRequest)
		return
	}

	mutex.Lock()
	defer mutex.Unlock()

	foundIndex := -1
	for i, rec := range records {
		if rec.ID == id {
			foundIndex = i
			break
		}
	}

	if foundIndex == -1 {
		http.Error(w, "Record not found", http.StatusNotFound)
		return
	}

	records = append(records[:foundIndex], records[foundIndex+1:]...)

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"message":"Record deleted successfully"}`))
}

func handleSeed(w http.ResponseWriter, r *http.Request) {
	countStr := r.URL.Query().Get("count")
	count := 5
	if c, err := strconv.Atoi(countStr); err == nil && c > 0 {
		count = c
	}

	mutex.Lock()
	defer mutex.Unlock()

	for i := 1; i <= count; i++ {
		rec := Record{
			ID:        nextID,
			SiteName:  fmt.Sprintf("node-%d.net", nextID),
			Revenue:   float64(150 * nextID),
			User:      fmt.Sprintf("dev_%d", nextID),
			Payload:   `{"status":"active","region":"ap-southeast-1"}`,
			CreatedAt: time.Now().Format("2006-01-02 15:04:05"),
		}
		records = append(records, rec)
		nextID++
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": fmt.Sprintf("Successfully seeded %d records", count)})
}

func handleStats(w http.ResponseWriter, r *http.Request) {
	mutex.RLock()
	defer mutex.RUnlock()

	totalRevenue := 0.0
	for _, rec := range records {
		totalRevenue += rec.Revenue
	}

	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)

	stats := Stats{
		TotalRecords:  len(records),
		TotalRevenue:  totalRevenue,
		AllocMemoryMB: float64(mem.Alloc) / 1024 / 1024,
		SysMemoryMB:   float64(mem.Sys) / 1024 / 1024,
		NumGoroutines: runtime.NumGoroutine(),
		Uptime:        time.Since(startTime).Round(time.Second).String(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

