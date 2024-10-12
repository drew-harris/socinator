import { trpc } from "./utils/trpc";

export const Homepage = () => {
  const testQuery = trpc.jobs.getSample.useQuery();

  return (
    <div className="bg-red-500">
      <div>Homepage</div>
      <pre>{JSON.stringify(testQuery.data, null, 4)}</pre>
    </div>
  );
};
