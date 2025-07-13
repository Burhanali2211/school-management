"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventCalendar = () => {
  const [value, onChange] = useState<Value>(new Date());
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (value instanceof Date && isMounted) {
      router.push(`?date=${value}`);
    }
  }, [value, router, isMounted]);

  if (!isMounted) {
    return <div className="flex items-center justify-center h-full">Loading calendar...</div>;
  }

  return <Calendar onChange={onChange} value={value} />;
};

export default EventCalendar;
