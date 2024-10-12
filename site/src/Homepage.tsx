import { useState } from "react";
import { trpc } from "./utils/trpc";

export const Homepage = () => {
  const [offset, setOffset] = useState(0);

  const testQuery = trpc.jobs.getSample.useQuery({ offset });

  return (
    <div className="bg-red-500">
      <input
        placeholder="Offset!"
        type="number"
        value={offset}
        onChange={(e) => setOffset(parseInt(e.target.value))}
      />
      <div>Homepage</div>
      <pre>{JSON.stringify(testQuery.data, null, 4)}</pre>
    </div>
  );
};
