import { describe, it, expect } from "vitest";
import { levenshtein, normalize } from "../utils/string-utils";

describe("levenshtein", () => {
    it("returns 0 for identical strings", () => {
        expect(levenshtein("hello", "hello")).toBe(0);
        expect(levenshtein("", "")).toBe(0);
    });

    it("handles empty strings", () => {
        expect(levenshtein("", "hello")).toBe(5);
        expect(levenshtein("hello", "")).toBe(5);
    });

    it("calculates single character differences", () => {
        expect(levenshtein("cat", "bat")).toBe(1); // 1 substitution
        expect(levenshtein("hello", "hllo")).toBe(1); // 1 deletion
        expect(levenshtein("hllo", "hello")).toBe(1); // 1 insertion
    });

    it("calculates multiple character differences", () => {
        expect(levenshtein("saturday", "sunday")).toBe(3);
        expect(levenshtein("kitten", "sitting")).toBe(3);
    });

    it("is case-sensitive", () => {
        expect(levenshtein("Hello", "hello")).toBe(1);
        expect(levenshtein("HELLO", "hello")).toBe(5);
    });

    it("handles special characters", () => {
        expect(levenshtein("hello!", "hello?")).toBe(1);
        expect(levenshtein("test@example.com", "test@sample.com")).toBe(2);
    });

    it("calculates distance for Turkish characters", () => {
        expect(levenshtein("çay", "cay")).toBe(1);
        expect(levenshtein("şeker", "seker")).toBe(1);
    });
});

describe("normalize", () => {
    it("converts to lowercase", () => {
        expect(normalize("HELLO")).toBe("hello");
        expect(normalize("HeLLo")).toBe("hello");
    });

    it("removes special characters except Turkish letters", () => {
        expect(normalize("hello!")).toBe("hello");
        expect(normalize("test@example.com")).toBe("testexamplecom");
        expect(normalize("foo-bar_baz")).toBe("foobar_baz");
    });

    it("preserves Turkish characters", () => {
        expect(normalize("çayŞeker")).toBe("çayşeker");
        expect(normalize("ĞÜİÖÇ")).toBe("ğüiöç");
    });

    it("normalizes whitespace", () => {
        expect(normalize("hello   world")).toBe("hello world");
        expect(normalize("  hello  world  ")).toBe("hello world");
        expect(normalize("hello\tworld\ntest")).toBe("hello world test");
    });

    it("handles empty and whitespace-only strings", () => {
        expect(normalize("")).toBe("");
        expect(normalize("   ")).toBe("");
    });

    it("handles mixed cases", () => {
        expect(normalize("Hello, World! 123")).toBe("hello world 123");
        expect(normalize("Test@123#XYZ")).toBe("test123xyz");
    });

    it("handles numbers", () => {
        expect(normalize("abc123def")).toBe("abc123def");
        expect(normalize("2024 yılı")).toBe("2024 yılı");
    });
});
