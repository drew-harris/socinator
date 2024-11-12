import { useState } from "react";
import { trpc } from "./utils/trpc";

interface ResultModalProps {
  jobId: string;
}
export const ResultModal = (props: ResultModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const inferMutation = trpc.jobs.getInference.useMutation();

  const openUp = async () => {
    setIsOpen(true);
  };

  const runInference = async () => {
    const result = await inferMutation.mutateAsync({ jobId: props.jobId });
    console.log("Inference result:", result);
  };

  const inputParams = trpc.jobs.getFullData.useQuery({ jobId: props.jobId });

  return (
    <>
      {!isOpen && (
        <div>
          <button
            onClick={openUp}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                clipRule="evenodd"
              />
            </svg>
            Run Inference
          </button>
        </div>
      )}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 grid place-items-center p-4">
          <div className="bg-neutral-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Inference Result</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-400 hover:text-white transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                onClick={runInference}
                disabled={inferMutation.status === "pending"}
              >
                {inferMutation.status === "pending" ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                Run Inference on {props.jobId}
              </button>
              <details>
                <summary>Job Data</summary>
                <pre>{JSON.stringify(inputParams.data, null, 4)}</pre>
              </details>
              <div className="mt-4">
                {inferMutation.status === "pending" && (
                  <p className="text-sm text-neutral-500">Inferring...</p>
                )}
                {inferMutation.status === "error" && (
                  <p className="text-sm text-red-500">
                    Error: {inferMutation.error.message}
                  </p>
                )}
                {inferMutation.status === "success" && (
                  <>
                    <p className="text-sm text-green-500">
                      Inference successful!
                    </p>
                    <pre>{JSON.stringify(inferMutation.data, null, 4)}</pre>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
