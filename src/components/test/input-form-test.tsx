"use client";

import { useForm } from "react-hook-form";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";

type FormValues = {
  email: string;
};

const InputFormTest = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = (data: FormValues) => {
    alert(JSON.stringify(data));
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full max-w-xs flex-col items-start gap-2"
    >
      <Input
        placeholder="email@example.com"
        {...register("email", {
          required: "이메일을 입력해주세요.",
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: "이메일 형식이 올바르지 않습니다.",
          },
        })}
      />
      {errors.email && (
        <span className="text-xs text-accent-alt">
          {errors.email.message}
        </span>
      )}
      <Button type="submit" variant="primary">
        Submit
      </Button>
    </form>
  );
};

export default InputFormTest;
