"use client";

import React, { useState } from "react";
import { subcategoryService } from "@/services/subcategoryService";
import type { Subcategory, ApiResponse } from "@/types";
import { FiPlay, FiLoader, FiCheck, FiX, FiCopy, FiCode } from "react-icons/fi";

interface TestResult {
  success: boolean;
  message: string;
  timestamp: string;
  data?: any;
}

export default function SubcategoryTester(): React.JSX.Element {
  const [activeTest, setActiveTest] = useState("");
  const [testData, setTestData] = useState({});
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (operation, success, message) => {
    setResults((prev) => ({
      ...prev,
      [operation]: {
        success,
        message,
        timestamp: new Date().toISOString(),
        data: success ? message : null,
      },
    }));
  };

  const handleTestDataChange = (field, value) => {
    setTestData((prev) => ({
      ...prev,
      [activeTest]: {
        ...prev[activeTest],
        [field]: value,
      },
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        alert("Copied to clipboard!");
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  const runTest = async (testCase) => {
    setIsLoading(true);

    try {
      let response;

      switch (testCase.id) {
        case "getAll":
          response = await subcategoryService.getAllSubcategories();
          addResult("Get All Subcategories", true, response.subcategories);
          break;
        case "create":
          {
            const { name, description, categoryId } = testData[activeTest];
            const formData = new FormData();
            formData.append("name", name);
            formData.append("description", description);
            formData.append("category", categoryId);

            // For now, let's skip the image upload to simplify
            response = await subcategoryService.createSubcategory(formData);
            addResult("Create Subcategory", true, response.payload.subcategory);
          }
          break;
        // Add other test cases here...
        default:
          throw new Error("Unknown test case");
      }
    } catch (error) {
      addResult(testCase.name, false, error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const testCases = [
    {
      id: "getAll",
      name: "Get All Subcategories",
      method: "GET",
      endpoint: "/api/subcategories",
      description: "Fetch all subcategories from the database",
    },
    {
      id: "create",
      name: "Create Subcategory",
      method: "POST",
      endpoint: "/api/subcategories",
      description: "Create a new subcategory",
      fields: [
        {
          name: "name",
          type: "text",
          required: true,
          placeholder: "Enter subcategory name",
        },
        {
          name: "description",
          type: "textarea",
          placeholder: "Enter description",
        },
        {
          name: "categoryId",
          type: "text",
          required: true,
          placeholder: "Enter category ID",
        },
      ],
    },
    // ...other test cases...
  ];

  return (
    <div className="space-y-6">
      {/* Test Case Tabs */}
      <div className="flex flex-wrap gap-2">
        {testCases.map((testCase) => (
          <button
            key={testCase.id}
            onClick={() => setActiveTest(testCase.id)}
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTest === testCase.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            <span
              className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded ${
                testCase.method === "GET"
                  ? "bg-green-500"
                  : testCase.method === "POST"
                  ? "bg-blue-500"
                  : testCase.method === "PUT"
                  ? "bg-orange-500"
                  : "bg-red-500"
              } text-white`}
            >
              {testCase.method.charAt(0)}
            </span>
            <span>{testCase.name}</span>
          </button>
        ))}
      </div>

      {/* Active Test Case */}
      {activeTest && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          {(() => {
            const testCase = testCases.find((tc) => tc.id === activeTest);
            if (!testCase) return null;

            return (
              <>
                {/* Test Case Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {testCase.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {testCase.description}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          testCase.method === "GET"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : testCase.method === "POST"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                            : testCase.method === "PUT"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }`}
                      >
                        {testCase.method}
                      </span>
                      <code className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
                        {testCase.endpoint}
                      </code>
                    </div>
                  </div>
                </div>

                {/* Test Case Content */}
                <div className="p-6">
                  {testCase.fields && (
                    <div className="space-y-4 mb-6">
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Test Parameters
                      </h4>
                      {testCase.fields.map((field) => (
                        <div key={field.name}>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            {field.name}{" "}
                            {field.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          {field.type === "textarea" ? (
                            <textarea
                              value={testData[activeTest]?.[field.name] || ""}
                              onChange={(e) =>
                                handleTestDataChange(field.name, e.target.value)
                              }
                              placeholder={field.placeholder}
                              rows={3}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                          ) : (
                            <input
                              type={field.type}
                              value={testData[activeTest]?.[field.name] || ""}
                              onChange={(e) =>
                                handleTestDataChange(field.name, e.target.value)
                              }
                              placeholder={field.placeholder}
                              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Run Test Button */}
                  <button
                    onClick={() => runTest(testCase)}
                    disabled={isLoading}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <>
                        <FiLoader className="w-5 h-5 animate-spin" />
                        <span>Running Test...</span>
                      </>
                    ) : (
                      <>
                        <FiPlay className="w-5 h-5" />
                        <span>Run Test</span>
                      </>
                    )}
                  </button>

                  {/* Test Results */}
                  {results[activeTest] && (
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          Test Results
                        </h4>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              JSON.stringify(results[activeTest], null, 2)
                            )
                          }
                          className="inline-flex items-center space-x-1 px-2 py-1 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                        >
                          <FiCopy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center space-x-2">
                        {results[activeTest].success ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            <FiCheck className="w-3 h-3" />
                            <span>Success</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            <FiX className="w-3 h-3" />
                            <span>Error</span>
                          </span>
                        )}
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {results[activeTest].timestamp}
                        </span>
                      </div>

                      {/* Response Data */}
                      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-4 overflow-auto">
                        <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                          {JSON.stringify(results[activeTest].data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {!activeTest && (
        <div className="text-center py-12">
          <FiCode className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
            Select a test case to begin
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Choose from the available API endpoints above to test functionality
          </p>
        </div>
      )}
    </div>
  );
}
