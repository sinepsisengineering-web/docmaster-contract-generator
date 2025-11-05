
import { GoogleGenAI, Type } from "@google/genai";
import { MarkerInfo } from '../types';

let ai: GoogleGenAI | null = null;
const getAI = () => {
    if (!ai) {
        if (!process.env.API_KEY) {
            console.error("API_KEY environment variable not set.");
            throw new Error("API_KEY is not configured.");
        }
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }
    return ai;
}


export const getMarkerInputType = async (markerName: string): Promise<MarkerInfo> => {
    try {
        const ai = getAI();
        const prompt = `
            Analyze the following contract marker name and determine the most appropriate HTML input type. The name is in Russian. 
            Respond with a single, valid JSON object with a "type" key.
            Possible values for "type" are "text", "number", "date", "email", "textarea", or "select".
            If the type is "select", also provide an "options" key with an array of suggested strings in Russian.
            If the marker implies a full name (ФИО), address (АДРЕС), or other generic text, use "text".
            Use "textarea" for descriptions or multi-line text.
            Use "date" for anything related to dates.
            Use "number" for amounts, quantities, or prices.
            
            Marker name: "{{${markerName}}}"
        `;

        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                type: { 
                    type: Type.STRING,
                    description: 'The suggested HTML input type.',
                    enum: ["text", "number", "date", "email", "textarea", "select"]
                },
                options: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING
                    },
                    description: 'Suggested options if type is select',
                    nullable: true
                }
            }
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema,
            },
        });

        const jsonString = response.text;
        const result = JSON.parse(jsonString);

        return {
            name: markerName,
            type: result.type,
            options: result.options || undefined,
        };
    } catch (error) {
        console.error(`Error processing marker "${markerName}" with Gemini:`, error);
        // Fallback in case of API error
        return { name: markerName, type: 'text' };
    }
};

// FIX: Add getChatResponse function to handle chatbot messages.
export const getChatResponse = async (prompt: string): Promise<string> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error getting chat response from Gemini:", error);
        throw new Error("Failed to get response from AI service.");
    }
};
