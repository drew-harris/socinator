import { useMemo, useState } from "react";
import { RouterOutput, trpc } from "./utils/trpc";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ResultModal } from "./ResultModal";

type Job = RouterOutput["jobs"]["getSample"][0];
const colHelp = createColumnHelper<Job>();

export const Homepage = () => {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(5);

  const testQuery = trpc.jobs.getSample.useQuery({ offset, limit });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold text-white mb-6">Job Sample Browser</h1>
        <div className="flex gap-4 flex-wrap">
          <div className="flex flex-col gap-2">
            <label htmlFor="offset" className="text-sm text-neutral-300">
              Offset
            </label>
            <input
              id="offset"
              className="bg-neutral-800 border border-neutral-600 rounded-lg px-4 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter offset..."
              min={0}
              max={10000}
              type="number"
              value={offset}
              onChange={(e) => setOffset(parseInt(e.target.value))}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="limit" className="text-sm text-neutral-300">
              Limit
            </label>
            <input
              id="limit"
              className="bg-neutral-800 border border-neutral-600 rounded-lg px-4 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter limit..."
              min={0}
              max={10000}
              type="number"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>

      {testQuery.isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin text-blue-500">
            <svg
              className="w-8 h-8"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>
      )}
      {testQuery.data && <JobsTable data={testQuery.data} />}
    </div>
  );
};

const JobsTable = ({ data }: { data: RouterOutput["jobs"]["getSample"] }) => {
  const cols = useMemo(() => {
    return [
      colHelp.accessor("JOB_ID", {
        header: "Job Id",
        cell: (info) => info.getValue() || "N/A",
      }),
      colHelp.accessor("ROLE_PRIMARY", {
        header: "Role",
        cell: (info) => {
          const value = info.getValue();
          return value && value !== ""
            ? value
            : info.row.original.SOC6D_TITLE || "N/A";
        },
      }),
      colHelp.accessor("SOC6D", {
        header: "SOC Code",
        cell: (info) => info.getValue() || "N/A",
      }),
      colHelp.accessor("SOC6D_TITLE", {
        header: "Soc Title",
        cell: (info) => info.getValue() || "N/A",
      }),
      colHelp.display({
        header: "Actions",
        cell(ctx) {
          const jobId = ctx.row.original.JOB_ID;
          if (!jobId) return null;
          return <ResultModal jobId={jobId} />;
        },
      }),
    ];
  }, []);

  console.log("Table data:", data);

  const table = useReactTable({
    data,
    columns: cols,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="border border-neutral-600 rounded-md p-2">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((h) => (
                <th
                  className="text-left p-2"
                  onClick={h.column.getToggleSortingHandler()}
                  key={h.id}
                >
                  {flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr className="border-b border-neutral-600" key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td className="p-2" key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
