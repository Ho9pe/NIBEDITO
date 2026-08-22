import { useState } from "react";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import {
  FiRefreshCw,
  FiPlay,
  FiCheck,
  FiX,
  FiCode,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { subcategoryService } from "@/services/subcategoryService";
import type { Product, Category, Subcategory } from "@/types";

interface TestResult {
  id: string;
  timestamp: string;
  testName: string;
  success: boolean;
  error: string | null;
  response: string | null;
}

export default function ProductTester() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);

  // Helper function to add test results to the list
  // Handles both success and error cases with proper formatting
  const addResult = (
    testName: string,
    response: any,
    success: boolean = true
  ): void => {
    // If it's an error response, format it once
    if (!success) {
      const errorMessage = response.error || response.message || response;
      setResults((prev) => [
        {
          id: `${Date.now()}-${testName}`,
          timestamp: new Date().toLocaleTimeString(),
          testName,
          success: false,
          error: errorMessage,
          response: null,
        },
        ...prev,
      ]);
      return;
    }
    // For successful responses
    setResults((prev) => [
      {
        id: `${Date.now()}-${testName}`,
        timestamp: new Date().toLocaleTimeString(),
        testName,
        success: true,
        error: null,
        response:
          typeof response === "object"
            ? JSON.stringify(response, null, 2)
            : response,
      },
      ...prev,
    ]);
  };

  // Helper function to fetch a random image from picsum
  // Returns a File object that can be used in FormData
  const getRandomImage = async (): Promise<File> => {
    const response = await fetch("https://picsum.photos/800/600");
    const blob = await response.blob();
    return new File([blob], "test-image.jpg", { type: "image/jpeg" });
  };

  const runAllTests = async (): Promise<void> => {
    setLoading(true);
    setResults([]);
    let testProduct: Product | null = null;
    try {
      // Test 1: Category and Subcategory Selection
      // - Fetches all active categories
      // - Fetches subcategories for the first category
      // - Randomly selects one category and subcategory for product creation
      // - Validates that at least one active category exists
      const categories = await categoryService.getActiveCategories();
      if (!categories.length) {
        throw new Error("No active categories found");
      }
      const randomIndex = Math.floor(Math.random() * categories.length);
      const selectedCategory = categories[randomIndex];
      addResult(
        "Category Selection",
        `Found ${categories.length} active categories and selected ${selectedCategory.name}`
      );

      // Get subcategories for the selected category
      const subcategories = await subcategoryService.getSubcategoriesByCategory(
        selectedCategory._id!
      );
      let selectedSubcategory: Subcategory | null = null;
      if (subcategories && subcategories.length > 0) {
        const subIndex = Math.floor(Math.random() * subcategories.length);
        selectedSubcategory = subcategories[subIndex];
        addResult(
          "Subcategory Selection",
          `Found ${subcategories.length} subcategories and selected ${selectedSubcategory.name}`
        );
      } else {
        addResult(
          "Subcategory Selection",
          "No subcategories found for the selected category",
          false
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Test 2: Product Creation
      // - Creates a new product with random data
      // - Includes thumbnail image
      // - Adds basic variant with color and size
      // - Tests FormData handling and image upload
      const createFormData = new FormData();
      const productName = `Test Product ${Date.now()}`;
      createFormData.append("name", productName);
      createFormData.append(
        "description",
        "This is a detailed test product description that meets the minimum length requirement."
      );
      createFormData.append("price", (Math.random() * 1000).toFixed(2));
      createFormData.append("category", selectedCategory._id!);
      if (selectedSubcategory) {
        createFormData.append("subcategory", selectedSubcategory._id!);
      }
      createFormData.append("shipping", "true");

      // Add thumbnail
      const image = await getRandomImage();
      createFormData.append("thumbnail", image);

      // Add variant with image indices
      const variants = [
        {
          color: "Black",
          size: "M",
          quantity: 10,
          imageIndices: [0], // This tells the server which variantImages to use
          images: [],
        },
      ];
      createFormData.append("variants", JSON.stringify(variants));

      // Add variant image
      const variantImage = await getRandomImage();
      createFormData.append("variantImages", variantImage);
      const createdProductResponse = await productService.createProduct(
        createFormData
      );
      testProduct = createdProductResponse.payload!.product;
      addResult("Create Product", createdProductResponse);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Test 3: Product Retrieval
      // - Fetches the created product using its slug
      // - Validates that the product data is correctly stored
      // - Tests the GET endpoint functionality
      const fetchedProduct = await productService.getProduct(testProduct.slug);
      addResult("Get Single Product", fetchedProduct);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Test 4: Product Update
      // - Updates product details including name, description, and price
      // - Tests the update endpoint with FormData
      // - Validates that the slug updates with name change
      const updateFormData = new FormData();
      updateFormData.append("name", `Updated ${testProduct.name}`);
      updateFormData.append(
        "description",
        "Updated description that meets the minimum length requirement"
      );
      updateFormData.append("price", (testProduct.price + 100).toFixed(2));
      updateFormData.append("category", selectedCategory._id!);
      if (selectedSubcategory) {
        updateFormData.append("subcategory", selectedSubcategory._id!);
      }
      updateFormData.append("shipping", testProduct.shipping!.toString());

      // Keep existing variant images
      const updatedVariants = testProduct.variants!.map((variant) => ({
        ...variant,
        images: variant.images, // Preserve existing images
      }));
      updateFormData.append("variants", JSON.stringify(updatedVariants));
      const updatedProduct = await productService.updateProduct(
        testProduct.slug,
        updateFormData
      );
      testProduct = updatedProduct.payload!.product;
      addResult("Update Product Details", updatedProduct);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Test 5: Product Deletion
      // - Deletes the test product
      // - Validates cleanup of associated images
      // - Tests cascade deletion of product data
      try {
        const deleteResponse = await productService.deleteProduct(
          testProduct.slug
        );
        addResult("Delete Product", deleteResponse);
      } catch (error: any) {
        addResult("Delete Product", error, false);
      }
    } catch (error: any) {
      addResult("Test Failed", error, false);
    } finally {
      setLoading(false);
    }
  };

  if (!isExpanded) {
    return (
      <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiCode className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
              API Tester
            </h3>
          </div>
          <button
            onClick={() => setIsExpanded(true)}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <FiChevronDown className="w-4 h-4" />
            <span>Expand</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <FiCode className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Product API Flow Tester
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Comprehensive testing of product CRUD operations
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={runAllTests}
            disabled={loading}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <FiRefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Tests...</span>
              </>
            ) : (
              <>
                <FiPlay className="w-4 h-4" />
                <span>Run Test Flow</span>
              </>
            )}
          </button>
          <button
            onClick={() => setIsExpanded(false)}
            className="inline-flex items-center space-x-1 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <FiChevronUp className="w-4 h-4" />
            <span>Collapse</span>
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        {results.length === 0 && !loading && (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
            <FiCode className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              No tests run yet
            </h4>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Click &quot;Run Test Flow&quot; to start the comprehensive API test suite.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 max-w-md mx-auto">
              <h5 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
                Test Flow Includes:
              </h5>
              <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 text-left">
                <li>• Category and subcategory selection</li>
                <li>• Product creation with images</li>
                <li>• Product retrieval and validation</li>
                <li>• Product update operations</li>
                <li>• Product deletion and cleanup</li>
              </ul>
            </div>
          </div>
        )}

        {results.map((result) => (
          <div
            key={result.id}
            className={`rounded-lg border overflow-hidden ${
              result.success
                ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
            }`}
          >
            <div className="px-4 py-3 border-b border-current border-opacity-20">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-1.5 rounded-full ${
                      result.success
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                    }`}
                  >
                    {result.success ? (
                      <FiCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <FiX className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <h4
                      className={`font-medium ${
                        result.success
                          ? "text-green-800 dark:text-green-300"
                          : "text-red-800 dark:text-red-300"
                      }`}
                    >
                      {result.testName}
                    </h4>
                    <p
                      className={`text-xs ${
                        result.success
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {result.timestamp}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    result.success
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {result.success ? "Success" : "Failed"}
                </span>
              </div>
            </div>

            {result.error && (
              <div className="px-4 py-3 bg-red-100 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                  Error: {result.error}
                </p>
              </div>
            )}

            {result.response && (
              <div className="p-4">
                <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 overflow-auto">
                  <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap">
                    {result.response}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-3 px-6 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <FiRefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
            <span className="text-blue-700 dark:text-blue-300 font-medium">
              Running API tests...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
