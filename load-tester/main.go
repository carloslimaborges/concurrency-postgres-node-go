package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "sync"
)

const baseURL = "http://localhost:3000"

// Deterministic scenario:
// User 1: final expected = 1500
// User 2: final expected = 1250
// User 3: final expected = 1000

func main() {
    http.Post(baseURL+"/reset", "application/json", nil)

    var wg sync.WaitGroup

    // User 1
    wg.Add(1)
    go func() {
        defer wg.Done()
        for i := 0; i < 100; i++ {
            doPost("/deposit", map[string]int{"userId": 1, "amount": 10})
            doPost("/withdraw", map[string]int{"userId": 1, "amount": 5})
        }
    }()

    // User 2
    wg.Add(1)
    go func() {
        defer wg.Done()
        for i := 0; i < 50; i++ {
            doPost("/deposit", map[string]int{"userId": 2, "amount": 20})
            doPost("/withdraw", map[string]int{"userId": 2, "amount": 15})
        }
    }()

    // User 3
    wg.Add(1)
    go func() {
        defer wg.Done()
        for i := 0; i < 200; i++ {
            doPost("/deposit", map[string]int{"userId": 3, "amount": 1})
        }
        for i := 0; i < 100; i++ {
            doPost("/withdraw", map[string]int{"userId": 3, "amount": 2})
        }
    }()

    wg.Wait()

    expected := map[int]int{
        1: 1500,
        2: 1250,
        3: 1000,
    }

    allGood := true
    for userId, exp := range expected {
        bal := getBalance(userId)
        fmt.Printf("User %d final balance: %d (expected %d)\n", userId, bal, exp)
        if bal != exp {
            allGood = false
        }
    }

    if allGood {
        fmt.Println("SUCCESS: All final balances match the expected results.")
    } else {
        fmt.Println("FAIL: Some final balances do not match the expected results.")
    }
}

func doPost(endpoint string, data interface{}) {
    b, _ := json.Marshal(data)
    _, err := http.Post(baseURL+endpoint, "application/json", bytes.NewReader(b))
    if err != nil {
        fmt.Println("Error:", err)
    }
}

func getBalance(userID int) int {
    resp, err := http.Get(fmt.Sprintf("%s/balance/%d", baseURL, userID))
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()
    var res map[string]int
    json.NewDecoder(resp.Body).Decode(&res)
    return res["balance"]
}
