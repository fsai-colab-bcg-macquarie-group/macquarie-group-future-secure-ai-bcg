export default function SecondaryBtn(props: {
  text: string
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      className={`secondary_button ${props.className}`}
      disabled={props.disabled}
    >
      {props.text}
    </button>
  )
}
