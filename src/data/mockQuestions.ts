export interface TestCase {
  input: string;
  expectedOutput: string;
  passed?: boolean;
}

export interface Question {
  id: string;
  type: 'mcq' | 'coding';
  category: 'Aptitude' | 'Logical' | 'Coding';
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  points: number;
  options?: string[];
  correctOption?: number;
  initialCode?: Record<string, string>;
  testCases?: TestCase[];
  tableData?: {
    headers: string[];
    rows: string[][];
  };
}

export const mockQuestions: Question[] = [
  {
    id: "apt-1",
    type: "mcq",
    category: "Aptitude",
    difficulty: "Medium",
    title: "Global Supply Chain Productivity Analysis",
    points: 15,
    description: `As a Lead Data Analyst, you are reviewing the quarterly throughput metrics of four global distribution centers (DCs). Analyze the table below showing the relative efficiency indices and raw shipping volumes.

Based on the quarterly data provided in the table, which of the following statements is mathematically accurate?`,
    tableData: {
      headers: ["Distribution Center (DC)", "Quarter 1 Vol (Tons)", "Quarter 2 Vol (Tons)", "Efficiency Index (Q1)", "Efficiency Index (Q2)"],
      rows: [
        ["DC-Alpha (Frankfurt)", "12,400", "14,100", "88.4%", "91.2%"],
        ["DC-Beta (Singapore)", "18,500", "17,900", "94.1%", "93.8%"],
        ["DC-Gamma (Chicago)", "15,200", "16,800", "82.5%", "85.9%"],
        ["DC-Delta (Tokyo)", "9,800", "11,200", "90.7%", "92.5%"]
      ]
    },
    options: [
      "DC-Alpha experienced the highest percentage increase in shipping volume from Q1 to Q2.",
      "The average efficiency index across all four centers decreased between Q1 and Q2.",
      "DC-Beta maintained the highest absolute efficiency index in both quarters, while showing the largest percentage decrease in shipping volume.",
      "DC-Delta is the most efficient center because its efficiency index grew by exactly 1.8% in Q2."
    ],
    correctOption: 0
  },
  {
    id: "log-1",
    type: "mcq",
    category: "Logical",
    difficulty: "Hard",
    title: "Cryptographic Key Dependency Matrix",
    points: 20,
    description: `Five cryptographic microservices (A, B, C, D, E) depend on each other for decryption keys. You are troubleshooting a security lock. The following rules govern their initialization:

1. E initialized immediately if A is functional.
2. If B is functional, C cannot initialize unless E is already active.
3. D cannot initialize if E is active, unless A is compromised.
4. B initializes only when D is active.

If Service A is active and functional, and Service E has initialized, which of the following represents a valid initialization sequence of the remaining microservices?`,
    options: [
      "A -> E -> D -> B -> C",
      "A -> E -> C -> D -> B",
      "A -> E -> B -> D -> C",
      "A -> E -> (B and C cannot initialize because D is blocked by E)"
    ],
    correctOption: 3
  },
  {
    id: "apt-2",
    type: "mcq",
    category: "Aptitude",
    difficulty: "Medium",
    title: "Cloud Infrastructure Cost Optimization",
    points: 15,
    description: `An enterprise application deploys 8 microservices on a public cloud. Each microservice consumes memory proportional to its workload.
- Microservices M1 to M4 consume 4GB, 8GB, 12GB, and 16GB of RAM respectively.
- Microservices M5 to M8 consume RAM equal to double the average memory consumed by M1 to M4.

Due to a pricing hike, the company needs to decommission one service from M1-M4 and one from M5-M8 to reduce total memory footprint by exactly 30GB. Which two services must be decommissioned?`,
    options: [
      "Decommission M1 and M5",
      "Decommission M2 and M7",
      "Decommission M3 and M6",
      "Decommission M4 and M8"
    ],
    correctOption: 3
  },
  {
    id: "cod-1",
    type: "coding",
    category: "Coding",
    difficulty: "Medium",
    title: "Secure Session Log Parser",
    points: 50,
    description: `### Problem Description

In an enterprise intrusion detection system, you are given a series of server request logs. A **suspicious session sequence** is defined as an array of request tokens where the absolute difference between any two adjacent request IDs is strictly increasing. 

Write a function \`validateSessionSequence\` that takes an array of positive integers \`tokens\` and determines if the difference between successive elements is strictly increasing. 

That is, let \`diff[i] = |tokens[i+1] - tokens[i]|\` for all \`0 <= i < tokens.length - 1\`. The array is valid if and only if:
\`diff[0] < diff[1] < diff[2] < ... < diff[n-2]\`

### Input Format
- An array of integers \`tokens\` where \`2 <= tokens.length <= 1000\`

### Output Format
- Return \`true\` if the differences are strictly increasing, and \`false\` otherwise.

### Examples
**Example 1:**
- **Input:** \`tokens = [1, 5, 2, 9, 0]\`
- **Output:** \`true\`
- **Explanation:**
  - \`diff[0] = |5 - 1| = 4\`
  - \`diff[1] = |2 - 5| = 3\` (Wait, this is NOT increasing! \`4 > 3\`. Output would be \`false\`)

**Example 2:**
- **Input:** \`tokens = [10, 11, 13, 17, 24]\`
- **Output:** \`true\`
- **Explanation:**
  - \`diff[0] = |11 - 10| = 1\`
  - \`diff[1] = |13 - 11| = 2\`
  - \`diff[2] = |17 - 13| = 4\`
  - \`diff[3] = |24 - 17| = 7\`
  - Differences are \`[1, 2, 4, 7]\`, which is strictly increasing. Output is \`true\`.`,
    initialCode: {
      javascript: `function validateSessionSequence(tokens) {
  // Write your code here
  return false;
}`,
      python: `def validate_session_sequence(tokens):
    # Write your code here
    return False`,
      cpp: `#include <vector>
#include <cmath>

class Solution {
public:
    bool validateSessionSequence(std::vector<int>& tokens) {
        // Write your code here
        return false;
    }
};`
    },
    testCases: [
      { input: "[10, 11, 13, 17, 24]", expectedOutput: "true" },
      { input: "[1, 5, 2, 9, 0]", expectedOutput: "false" },
      { input: "[3, 5, 8, 13, 20]", expectedOutput: "true" },
      { input: "[5, 10, 14, 19, 21]", expectedOutput: "false" }
    ]
  },
  {
    id: "cod-2",
    type: "coding",
    category: "Coding",
    difficulty: "Hard",
    title: "Optimize Blockchain Ledger Auditing",
    points: 100,
    description: `### Problem Description

You are auditing a blockchain-based transaction ledger. The ledger contains an array of daily transactions \`ledger\` where \`ledger[i]\` represents the net transaction value on day \`i\`.

To optimize auditing, you must find a sub-ledger (a contiguous subarray) of length **at least** \`minDays\` that has the **maximum average transaction value**.

Write a function \`findMaxAuditedSubledger\` that returns this maximum average. Your answer will be considered correct if it is within \`10^-5\` of the actual solution.

### Input Format
- An array of integers \`ledger\` where \`1 <= ledger.length <= 10000\`
- An integer \`minDays\` where \`1 <= minDays <= ledger.length\`

### Output Format
- Return the maximum average value as a float/double.

### Examples
**Example 1:**
- **Input:** \`ledger = [1, 12, -5, -6, 50, 3], minDays = 4\`
- **Output:** \`12.75\`
- **Explanation:**
  - Subarrays of length 4 or more:
    - \`[1, 12, -5, -6]\` -> average = \`2 / 4 = 0.5\`
    - \`[12, -5, -6, 50]\` -> average = \`51 / 4 = 12.75\`
    - \`[-5, -6, 50, 3]\` -> average = \`42 / 4 = 10.5\`
    - \`[1, 12, -5, -6, 50]\` -> average = \`52 / 5 = 10.4\`
    - \`[12, -5, -6, 50, 3]\` -> average = \`54 / 5 = 10.8\`
    - \`[1, 12, -5, -6, 50, 3]\` -> average = \`55 / 6 = 9.16667\`
  - The maximum average is \`12.75\`.`,
    initialCode: {
      javascript: `function findMaxAuditedSubledger(ledger, minDays) {
  // Write your code here
  return 0.0;
}`,
      python: `def find_max_audited_subledger(ledger, min_days):
    # Write your code here
    return 0.0`,
      cpp: `#include <vector>
#include <algorithm>
#include <iostream>

class Solution {
public:
    double findMaxAuditedSubledger(std::vector<int>& ledger, int minDays) {
        // Write your code here
        return 0.0;
    }
};`
    },
    testCases: [
      { input: "[1, 12, -5, -6, 50, 3], 4", expectedOutput: "12.75" },
      { input: "[5, 5, 5, 5, 5], 1", expectedOutput: "5.0" },
      { input: "[1, 2, 3, 4, 5], 2", expectedOutput: "4.5" },
      { input: "[10, -2, 3, -1, 20], 3", expectedOutput: "9.0" }
    ]
  }
];
