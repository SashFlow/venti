"use client";

import { useCallback, useEffect, useState } from "react";

import { Image as ImageIcon } from "lucide-react";
import { useForm } from "react-hook-form";

import { Button } from "../shadcn/button";
import { ImageUploadInput } from "./image-upload-input";
import { Trans } from "./trans";

export function ImageUploader(
	props: React.PropsWithChildren<{
		value: string | null | undefined;
		onValueChange: (value: File | null) => unknown;
	}>,
) {
	const [image, setImage] = useState(props.value);

	const { setValue, register } = useForm<{
		value: string | null | FileList;
	}>({
		defaultValues: {
			value: props.value,
		},
		mode: "onChange",
		reValidateMode: "onChange",
	});

	const control = register("value");

	const onClear = useCallback(() => {
		props.onValueChange(null);
		setValue("value", null);
		setImage("");
	}, [props, setValue]);

	const onValueChange = useCallback(
		({ image, file }: { image: string; file: File }) => {
			props.onValueChange(file);

			setImage(image);
		},
		[props],
	);

	const Input = () => (
		<ImageUploadInput
			{...control}
			accept={"image/*"}
			className={"absolute h-full w-full"}
			visible={false}
			multiple={false}
			onValueChange={onValueChange}
		/>
	);

	useEffect(() => {
		setImage(props.value);
	}, [props.value]);

	if (!image) {
		return (
			<FallbackImage descriptionSection={props.children}>
				<Input />
			</FallbackImage>
		);
	}

	return (
		<div className={"flex items-center space-x-4"}>
			<button
				type="button"
				className={
					"animate-in fade-in zoom-in-50 relative h-20 w-20 cursor-pointer border-0 bg-transparent p-0"
				}
				onClick={() => {
					// Handle click to trigger image upload
				}}
			>
				{/* biome-ignore lint/performance/noImgElement: required for library component optimization */}
				<img
					decoding="async"
					className={"h-20 w-20 rounded-full object-cover"}
					src={image}
					alt={""}
				/>

				<Input />
			</button>

			<div>
				<Button onClick={onClear} size={"sm"} variant={"ghost"}>
					<Trans i18nKey={"common:clear"} />
				</Button>
			</div>
		</div>
	);
}

function FallbackImage(
	props: React.PropsWithChildren<{
		descriptionSection?: React.ReactNode;
	}>,
) {
	return (
		<div className={"flex items-center space-x-4"}>
			<button
				type="button"
				className={
					"border-border animate-in fade-in zoom-in-50 hover:border-primary relative flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-full border bg-transparent p-0"
				}
				onClick={() => {
					// Handle click to trigger image upload
				}}
			>
				<ImageIcon className={"text-primary h-8"} />

				{props.children}
			</button>

			{props.descriptionSection}
		</div>
	);
}
