import { trpc } from "./utils/trpc";

export const Homepage = () => {
  const testQuery = trpc.test.useQuery();

  return (
    <div>
      <div>Homepage</div>
      <pre>{JSON.stringify(testQuery.data, null, 4)}</pre>
    </div>
  );
};
