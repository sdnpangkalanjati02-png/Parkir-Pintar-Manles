# Firestore Security Specification

## Data Invariants
1. `logs`: Every parking log must have a `branchId` that matches an existing branch. `entryTime` must be in the past. `exitTime` must be after `entryTime` if present.
2. `members`: Must have a valid `plateNumber`. `status` must be 'active' or 'expired'.
3. `employees`: `employeeId` must be unique (checked via client-side or admin check).
4. `hardware`: Must belong to a valid `branchId`.
5. `issues`: Must have a `reporterId` and `branchId`.
6. `configs`: Global config accessible only by admins for writing.

## The Dirty Dozen Payloads (Red Team Test Cases)

1. **Identity Spoofing**: Attempt to create a `log` with a `branchId` the user doesn't belong to.
2. **Identity Spoofing**: Attempt to create a `user` profile as another user.
3. **Privilege Escalation**: Non-admin attempting to update `configs/main`.
4. **Data Corruption**: Attempt to set `entryTime` to a future date.
5. **Data Corruption**: Attempt to set `exitTime` before `entryTime`.
6. **Data Corruption**: Attempt to set a negative `fare`.
7. **Resource Exhaustion**: Attempt to create a document with a massive string field (>1MB).
8. **ID Poisoning**: Attempt to create a document with a 1KB long ID.
9. **Update Gap**: Attempt to change the `id` of an existing log.
10. **Identity Spoofing**: Non-reporter attempting to close an issue ticket.
11. **State Shortcut**: Attempt to set log status from 'parked' to 'exited' without an `exitTime`.
12. **PII Leak**: Unauthenticated user attempting to list `members` or `employees`.

## Test Runner (firestore.rules.test.ts)

```typescript
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "park-pintar-test",
    firestore: {
      rules: fs.readFileSync("firestore.rules", "utf8"),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

test("Non-admin cannot write config", async () => {
  const alice = testEnv.authenticatedContext("alice");
  await assertFails(setDoc(doc(alice.firestore(), "configs/main"), { hourlyRateCar: 100 }));
});

test("User can read their own profile", async () => {
  const alice = testEnv.authenticatedContext("alice");
  await assertSucceeds(getDoc(doc(alice.firestore(), "users/alice")));
});

test("Staff can create logs", async () => {
  const staff = testEnv.authenticatedContext("staff_1", { role: 'karyawan' });
  await assertSucceeds(setDoc(doc(staff.firestore(), "logs/log_1"), {
    id: "log_1",
    ticketCode: "PK-123",
    plateNumber: "B1234ABC",
    entryTime: Date.now(),
    status: "parked",
    vehicleType: "car",
    branchId: "branch_1"
  }));
});
```
