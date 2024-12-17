import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 50,
  duration: "10s",
};

export default function () {
  let res = http.post(
    `http://localhost:3000/deposit`,
    JSON.stringify({ userId: 1, amount: 10 }),
    { headers: { "Content-Type": "application/json" } }
  );
  check(res, { "deposit status 200": (r) => r.status === 200 });

  res = http.post(
    `http://localhost:3000/withdraw`,
    JSON.stringify({ userId: 1, amount: 5 }),
    { headers: { "Content-Type": "application/json" } }
  );
  check(res, { "withdraw status 200": (r) => r.status === 200 });

  sleep(0.1);
}
