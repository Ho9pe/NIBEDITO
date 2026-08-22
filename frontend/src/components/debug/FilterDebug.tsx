"use client";

export default function FilterDebug({ filters, localFilters }) {
  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">Filter Debug</h4>
      <div className="space-y-1">
        <div>
          <strong>Parent Filters:</strong>
          <pre>{JSON.stringify(filters, null, 2)}</pre>
        </div>
        <div>
          <strong>Local Filters:</strong>
          <pre>{JSON.stringify(localFilters, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
