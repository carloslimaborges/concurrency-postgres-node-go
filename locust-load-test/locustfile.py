from locust import HttpUser, task, between

class BankUser(HttpUser):
    wait_time = between(0.05, 0.1)

    @task
    def deposit_and_withdraw(self):
        with self.client.post("/deposit", json={"userId": 1, "amount": 10}, catch_response=True) as res:
            if res.status_code != 200:
                res.failure("Failed deposit")

        with self.client.post("/withdraw", json={"userId": 1, "amount": 5}, catch_response=True) as res:
            if res.status_code != 200:
                res.failure("Failed withdraw")
