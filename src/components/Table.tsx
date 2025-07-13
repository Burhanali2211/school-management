const Table = ({
  columns,
  renderRow,
  data,
}: {
  columns: { header: string; accessor: string; className?: string }[];
  renderRow: (item: any) => React.ReactNode;
  data: any[];
}) => {
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-medium">
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-primary-50 to-primary-100 text-left text-primary-700 text-sm font-semibold border-b border-primary-200">
            {columns.map((col) => (
              <th key={col.accessor} className={`px-6 py-4 ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {data.map((item) => renderRow(item))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8a2 2 0 00-2-2H7a2 2 0 00-2 2v3a2 2 0 002 2h10a2 2 0 002-2V5z" />
            </svg>
          </div>
          <p className="text-neutral-500 text-lg font-medium">No data available</p>
          <p className="text-neutral-400 text-sm mt-2">Try adjusting your filters or search criteria</p>
        </div>
      )}
    </div>
  );
};

export default Table;
