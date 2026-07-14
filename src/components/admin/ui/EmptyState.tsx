export function EmptyState({
  title,
  colSpan,
}: {
  title: string;
  colSpan?: number;
}) {
  if (colSpan) {
    return (
      <tr>
        <td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-gray-400">
          {title}
        </td>
      </tr>
    );
  }
  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 px-4 py-12 text-center text-sm text-gray-400">
      {title}
    </div>
  );
}
