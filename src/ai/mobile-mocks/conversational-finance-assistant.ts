export const ConversationalFinanceAssistantInputSchema = {};
export type ConversationalFinanceAssistantInput = any;
export type ConversationalFinanceAssistantOutput = {
    response: string;
};

export async function conversationalFinanceAssistant(
    input: any
): Promise<ConversationalFinanceAssistantOutput> {
    throw new Error('AI Chatbot is currently unavailable in offline mode.');
}
