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
          <button onClick={openUp}>Run Inference on {props.jobId}</button>
        </div>
      )}
      {isOpen && (
        <div className="absolute top-0 grid place-items-center left-0 w-screen h-screen bg-black/50 z-10">
          <div className="">
            <div className="bg-neutral-800 min-w-[300px] rounded-lg p-4 shadow-lg">
              <div className="flex justify-between">
                <h2 className="text-2xl font-bold">Inference Result</h2>
                <button onClick={() => setIsOpen(false)}>Close</button>
              </div>
              <button
                className="mt-4 bg-neutral-500 hover:bg-neutral-600 text-white font-bold py-2 px-4 rounded-lg"
                onClick={runInference}
              >
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
