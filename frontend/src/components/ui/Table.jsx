export default function Table({ columns, data, emptyText = 'Данные не найдены' }) {
  return (
    <div style={s.tableWrap}>
      <table style={s.table}>
        <thead>
          <tr style={s.thead}>
            {columns.map(col => (
              <th key={col.key} style={{ ...s.th, width: col.width || 'auto' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={columns.length} style={s.empty}>{emptyText}</td></tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id ?? i} style={s.tr}>
                {columns.map(col => (
                  <td key={col.key} style={s.td}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const s = {
  tableWrap: { background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table:     { width: '100%', borderCollapse: 'collapse' },
  thead:     { background: '#f8f9fa' },
  th:        { padding: '14px 16px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#555', borderBottom: '1px solid #eee' },
  tr:        { borderBottom: '1px solid #f0f0f0' },
  td:        { padding: '12px 16px', fontSize: '14px', color: '#333' },
  empty:     { padding: '32px', textAlign: 'center', color: '#aaa' },
};
