import {
  Select as SelectShadCN,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "../ui/select";

interface SelectProps {
  options: { label: string; value: string }[];
  onChange?: (value: string) => void;
  placeholder?: string;
}

const Select = ({ options, onChange, placeholder = "select" }: SelectProps) => {
  return (
    <SelectShadCN onValueChange={onChange}>
      <SelectTrigger
        data-cy="select-toggle"
        className="border h-10 border-black/20 shadow-none bg-white text-muted-foreground"
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        data-cy="select-menu"
        className="bg-white text-black shadow-lg"
      >
        <SelectGroup>
          {options.map(({ value, label }, index) => (
            <SelectItem
              key={index}
              value={value}
              className="cursor-pointer px-3 py-2 rounded transition-colors duration-150 
              hover:bg-ttickles-lightblue hover:text-ttickles-blue
              focus:bg-gray-200 focus:text-black
              data-[state=checked]:bg-gray-500 data-[state=checked]:text-white"
            >
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </SelectShadCN>
  );
};

export default Select;
