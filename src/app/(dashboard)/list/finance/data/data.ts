import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircledIcon,
  CircleIcon,
  CrossCircledIcon,
  QuestionMarkCircledIcon,
  StopwatchIcon,
} from "@radix-ui/react-icons";



export const statuses = [
  {
    value: "PAID",
    label: "Paid",
    icon: CheckCircledIcon,
  },
  {
    value: "UNPAID",
    label: "Unpaid",
    icon: CircleIcon,
  },
  {
    value: "OVERDUE",
    label: "Overdue",
    icon: CrossCircledIcon,
  },
];