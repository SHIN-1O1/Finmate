export const DailyBriefingInputSchema = {};
// Mock return type
export type DailyBriefingInput = any;
export type DailyBriefingOutput = {
    spendableToday: number;
    avoidCategory?: string;
    warningMessage?: string;
    behaviorNudge?: string;
    mainMessage: string;
    reasoning: string;
};

export async function getDailyBriefing(input: any): Promise<DailyBriefingOutput> {
    // In a real mobile app, you would fetch the remote server here.
    // fetch('https://api.myapp.com/ai/daily-briefing', { body: JSON.stringify(input) ... })

    // For now, return a safe fallback or error that the UI handles gracefully.
    throw new Error('AI features require online connectivity. Please check back later.');
}
