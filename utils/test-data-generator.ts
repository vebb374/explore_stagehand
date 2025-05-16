export function generateRandomEmail(): string {
    return `test-${Math.random().toString(36).substring(2, 6)}-${Date.now()}@example.com`;
}

export function generateRandomAssessmentName(): string {
    return `Test Assessment ${Date.now()}`;
}
