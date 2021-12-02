import { Form } from "@react-spectrum/form";
import { Flex } from "@react-spectrum/layout";
import { View } from "@react-spectrum/view";
import { TextField } from "@react-spectrum/textfield";
import { Button } from "@react-spectrum/button";
import { FormEvent, useEffect, useState } from "react";
import { iCategory } from "@components/interfaces";
import React from "react";

type CategoryFormProps = {
  category: iCategory;
  closeForm: React.Dispatch<React.SetStateAction<boolean>>;
  updateCategory: (method: string, id: number, data: iCategory) => void;
}

export default function CategoryForm(props: CategoryFormProps) {
  let { category, closeForm, updateCategory } = props;
  let [data, setData] = useState<iCategory>(category);

  let isNameValid = React.useMemo(
    () => data && data.name && data.name.length > 0,
    [data]
  )

  useEffect(() => {
    let isLoaded = false;

    if (!isLoaded) {
      setData(category);
    }

    return () => { isLoaded = true }
  }, [category])

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    updateCategory(data.id === 0 ? "POST" : "PUT", data.id, data)
  }

  return (
    <Form onSubmit={handleSubmit} isEmphasized>
        <TextField
          placeholder={"e.g. Perikanan"}
          autoFocus
          isRequired
          validationState={isNameValid ? "valid" : "invalid"}
          flex
          width={"auto"}
          label={"Nama Kategori"}
          value={data.name}
          onChange={(e) => setData((o) => ({ ...o, name: e }))}
        />
      <Flex marginTop={"size-200"} direction="row" gap="size-100">
        <View flex>
          <Button type={"submit"} variant="cta"
            isDisabled={isNameValid === ""}>
            Save
          </Button>
          <Button
            type={"button"}
            variant="secondary"
            marginStart={"size-100"}
            onPress={() => closeForm(false)}
          >
            Cancel
          </Button>
        </View>
        {data.id > 0 && (
          <View>
            <Button type={"button"} variant="negative"
              onPress={() => updateCategory("DELETE", data.id, data)}>
              Delete
            </Button>
          </View>
        )}
      </Flex>
    </Form >
  )
}