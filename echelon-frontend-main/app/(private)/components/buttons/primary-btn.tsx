export default function PrimaryBtn(props: {
  text: string
  type?: 'button' | 'submit'
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type={props.type}
      className={`primary_button ${props.className}`}
      disabled={props.disabled}
    >
      {props.text}
    </button>
  )
}
