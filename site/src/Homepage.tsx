import { useMemo, useState } from "react";
import { RouterOutput, trpc } from "./utils/trpc";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

type Job = RouterOutput["jobs"]["getSample"][0];
const colHelp = createColumnHelper<Job>();

export const Homepage = () => {
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(5);

  const testQuery = trpc.jobs.getSample.useQuery({ offset, limit });

  return (
    <div className="p-4">
      <input
        className="text-black placeholder:text-neutral-700 p-2"
        placeholder="Offset!"
        min={0}
        max={10000}
        type="number"
        value={offset}
        onChange={(e) => setOffset(parseInt(e.target.value))}
      />
      <input
        className="text-black placeholder:text-neutral-700 p-2"
        placeholder="Limit!"
        min={0}
        max={10000}
        type="number"
        value={limit}
        onChange={(e) => setLimit(parseInt(e.target.value))}
      />
      <div className="h-10"></div>
      {testQuery.data && <JobsTable data={testQuery.data} />}
    </div>
  );
};

const JobsTable = ({ data }: { data: RouterOutput["jobs"]["getSample"] }) => {
  const cols = useMemo(() => {
    return [
      colHelp.accessor("JOB_ID", {
        header: "Job Id",
      }),
      colHelp.accessor("ROLE_PRIMARY", {
        header: "Role",
      }),
      colHelp.accessor("SOC6D", {
        header: "SOC Code",
      }),
      colHelp.accessor("SOC6D_TITLE", {
        header: "Soc Titile",
      }),
      colHelp.display({
        header: "Actions",
        cell() {
          return <div>actions here</div>;
        },
      }),
    ];
  }, []);

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
                <th onClick={h.column.getToggleSortingHandler()} key={h.id}>
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
                <td width={cell.column.columnDef.size} key={cell.id}>
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
