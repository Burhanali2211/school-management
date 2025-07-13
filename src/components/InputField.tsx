import { FieldError } from "react-hook-form";

type InputFieldProps = {
  label: string;
  type?: string;
  register: any;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  hidden?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue,
  error,
  hidden,
  inputProps,
}: InputFieldProps) => {
  return (
    <div className={hidden ? "hidden" : "flex flex-col gap-2 w-full md:w-1/4"}>
      <label className="text-sm text-neutral-700 font-medium">{label}</label>
      <input
        type={type}
        {...register(name)}
        className="ring-2 ring-neutral-300 focus:ring-primary-500 focus:border-primary-300 p-3 rounded-lg text-sm w-full transition-all duration-200 bg-white hover:ring-neutral-400"
        {...inputProps}
        defaultValue={defaultValue}
      />
      {error?.message && (
        <p className="text-xs text-error-600 bg-error-50 p-2 rounded border border-error-200">{error.message.toString()}</p>
      )}
    </div>
  );
};

export default InputField;
