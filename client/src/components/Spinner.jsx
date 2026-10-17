/**
 * Accessible loading spinner component.
 *
 * @param {object} props
 * @param {string} [props.size='1.25rem'] - CSS size string (width & height)
 * @param {string} [props.color] - Optional border color
 * @param {string} [props.label='Loading...'] - Accessible label for screen readers
 */
export default function Spinner({ size = '1.25rem', color, label = 'Loading...' }) {
  return (
    <span
      className="spinner"
      role="status"
      aria-label={label}
      style={{
        width: size,
        height: size,
        ...(color ? { borderTopColor: color } : {}),
      }}
    >
      <span className="sr-only">{label}</span>
    </span>
  );
}
