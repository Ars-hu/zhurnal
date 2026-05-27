const gradeColors = {
  5:   { background: '#dcfce7', color: '#16a34a' },
  4:   { background: '#dbeafe', color: '#1d4ed8' },
  3:   { background: '#fef9c3', color: '#854d0e' },
  2:   { background: '#fee2e2', color: '#dc2626' },
  'н': { background: '#f1f5f9', color: '#64748b' },
};

export default function GradeChip({ grade, onClick, size = 'md' }) {
  const dim = size === 'lg' ? '44px' : '34px';
  const fs  = size === 'lg' ? '18px' : '14px';
  const colors = gradeColors[grade] ?? gradeColors[2];

  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        borderRadius: '50%',
        fontWeight: '800',
        fontSize: fs,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.1s',
        ...colors,
      }}
      title={onClick ? 'Нажмите чтобы удалить' : ''}
    >
      {grade}
    </span>
  );
}
