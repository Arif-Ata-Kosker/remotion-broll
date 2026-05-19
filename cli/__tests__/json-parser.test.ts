import { describe, it, expect } from "vitest";
import { z } from "zod";
import { parseAIResponse, parseAndValidate, extractJSON } from "../utils/json-parser";

describe("parseAIResponse", () => {
    it("parses plain JSON object", () => {
        const input = '{"name": "test", "value": 42}';
        const result = parseAIResponse(input);
        expect(result).toEqual({ name: "test", value: 42 });
    });

    it("parses plain JSON array", () => {
        const input = '[{"id": 1}, {"id": 2}]';
        const result = parseAIResponse(input);
        expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("removes markdown code fences", () => {
        const input = '```json\n{"name": "test"}\n```';
        const result = parseAIResponse(input);
        expect(result).toEqual({ name: "test" });
    });

    it("removes markdown code fences without language tag", () => {
        const input = '```\n{"name": "test"}\n```';
        const result = parseAIResponse(input);
        expect(result).toEqual({ name: "test" });
    });

    it("extracts JSON from text with prefix", () => {
        const input = 'Here is the JSON:\n{"name": "test"}';
        const result = parseAIResponse(input);
        expect(result).toEqual({ name: "test" });
    });

    it("extracts JSON from text with suffix", () => {
        const input = '{"name": "test"}\nThat\'s the result.';
        const result = parseAIResponse(input);
        expect(result).toEqual({ name: "test" });
    });

    it("extracts JSON from mixed text", () => {
        const input = 'Some text before\n{"name": "test"}\nSome text after';
        const result = parseAIResponse(input);
        expect(result).toEqual({ name: "test" });
    });

    it("handles nested objects", () => {
        const input = '{"outer": {"inner": {"deep": "value"}}}';
        const result = parseAIResponse(input);
        expect(result).toEqual({ outer: { inner: { deep: "value" } } });
    });

    it("throws error for invalid JSON", () => {
        const input = '{invalid json}';
        expect(() => parseAIResponse(input)).toThrow("Failed to parse JSON");
    });

    it("throws error for non-JSON text", () => {
        const input = 'This is just plain text without any JSON';
        expect(() => parseAIResponse(input)).toThrow();
    });
});

describe("parseAndValidate", () => {
    const schema = z.object({
        name: z.string(),
        age: z.number(),
    });

    it("parses and validates correct data", () => {
        const input = '{"name": "Alice", "age": 30}';
        const result = parseAndValidate(input, schema);
        expect(result).toEqual({ name: "Alice", age: 30 });
    });

    it("parses markdown-wrapped JSON and validates", () => {
        const input = '```json\n{"name": "Bob", "age": 25}\n```';
        const result = parseAndValidate(input, schema);
        expect(result).toEqual({ name: "Bob", age: 25 });
    });

    it("throws validation error for wrong type", () => {
        const input = '{"name": "Charlie", "age": "thirty"}';
        expect(() => parseAndValidate(input, schema)).toThrow("validation failed");
    });

    it("throws validation error for missing field", () => {
        const input = '{"name": "Dave"}';
        expect(() => parseAndValidate(input, schema)).toThrow("validation failed");
    });

    it("throws validation error for extra fields not in strict mode", () => {
        const input = '{"name": "Eve", "age": 28, "extra": "field"}';
        // Should pass because zod allows extra fields by default
        const result = parseAndValidate(input, schema);
        expect(result.name).toBe("Eve");
        expect(result.age).toBe(28);
    });

    it("works with complex schemas", () => {
        const complexSchema = z.object({
            user: z.object({
                name: z.string(),
                email: z.string().email(),
            }),
            tags: z.array(z.string()),
        });

        const input = '{"user": {"name": "Test", "email": "test@example.com"}, "tags": ["tag1", "tag2"]}';
        const result = parseAndValidate(input, complexSchema);
        expect(result.user.name).toBe("Test");
        expect(result.tags).toEqual(["tag1", "tag2"]);
    });
});

describe("extractJSON", () => {
    it("uses parseAIResponse for simple cases", () => {
        const input = '{"name": "test"}';
        const result = extractJSON(input);
        expect(result).toEqual({ name: "test" });
    });

    it("handles markdown wrapped JSON", () => {
        const input = '```json\n{"name": "test"}\n```';
        const result = extractJSON(input);
        expect(result).toEqual({ name: "test" });
    });

    it("finds JSON in multi-line text", () => {
        const input = `
        Some random text
        More text here
        {"name": "test", "value": 42}
        Even more text
        `;
        const result = extractJSON(input);
        expect(result).toEqual({ name: "test", value: 42 });
    });

    it("finds JSON array in text", () => {
        const input = `
        Here are the results:
        [{"id": 1}, {"id": 2}]
        End of results
        `;
        const result = extractJSON(input);
        expect(result).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("throws error when no valid JSON found", () => {
        const input = "This is just plain text\nwith multiple lines\nno JSON here";
        expect(() => extractJSON(input)).toThrow("No valid JSON found");
    });

    it("handles complex nested structures in noisy text", () => {
        const input = `
        Response from AI:
        Here's what I found:
        {"data": {"users": [{"name": "Alice"}, {"name": "Bob"}]}}
        Hope this helps!
        `;
        const result = extractJSON(input);
        expect(result).toEqual({
            data: { users: [{ name: "Alice" }, { name: "Bob" }] },
        });
    });
});
