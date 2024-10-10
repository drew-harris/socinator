import { useEffect, useState } from "react";
import "./App.css";
type ApiResponse = {
  message: string;
  snowflakeConnected: boolean;
  rows: unknown[];
};

function App() {
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const response = await fetch(
        import.meta.env.VITE_PUBLIC_API_URL + "snowflake",
      );
      const data = await response.json();
      setResult(data);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <>
      {loading && <p>Loading...</p>}
      {result && (
        <div>
          <p>Snowflake connected: {result.snowflakeConnected ? "yes" : "no"}</p>
          <p>Sample Rows:</p>
          <div>
            {result.rows.map((row) => (
              <pre
                style={{
                  border: "1px solid white",
                  padding: "3px",
                  textAlign: "left",
                }}
              >
                {JSON.stringify(row, null, 2)}
              </pre>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
