import { NextPage } from "next";
import React, { FormEvent, useState } from "react";
import { dateOnly, iLunas } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Form } from "@react-spectrum/form";
import { TextArea, TextField } from "@react-spectrum/textfield";
import { Button } from "@react-spectrum/button";

import { NumberField } from "@react-spectrum/numberfield";

type PelunasanFormProps = {
  data: iLunas,
  handleSubmit: (method: string, e: iLunas | number) => void,
  children: JSX.Element
};

const PelunasanForm: NextPage<PelunasanFormProps> = (props) => {
  let { data, children, handleSubmit } = props;
  let [lunas, setLunas] = React.useState<iLunas>({} as iLunas);
  let [message, setMessage] = useState<string>("");

  const isDescriptionValid = React.useMemo(
    () => lunas && lunas.descriptions && lunas.descriptions.length > 0,
    [lunas]
  )

  React.useEffect(() => {
    let isLoaded = false;

    if (!isLoaded) {
      setLunas(data);
    }

    return () => {
      isLoaded = true;
    };
  }, [data]);

  return (
    <Form onSubmit={submitForm}>
      <Flex direction={"column"} gap={"size-100"}>
        <TextArea
          validationState={isDescriptionValid ? "valid" : "invalid"}
          autoFocus
          width={"auto"}
          flex
          placeholder={"e.g. Pelunasan piutang dagang bulan " + (new Date()).toLocaleDateString("id-ID", {month: "long"})}
          label={"Keterangan"}
          value={lunas.descriptions}
          onChange={(e) => setLunas((o) => ({ ...o, descriptions: e }))}
        />
        <View>Jika ada sisa piutang akan dimutasi ke dalam kasbon baru.</View>
        <Flex direction={"row"} columnGap={"size-100"}>
          <TextField
            type={"date"}
            width={"auto"}
            placeholder={"e.g. dd/mm/yyyy"}
            isRequired
            label={"Tanggal pelunasan"}
            value={dateOnly(lunas.createdAt)}
            onChange={(e) => setLunas((o) => ({ ...o, createdAt: e }))}
          />
          <NumberField
            width={"auto"}
            isReadOnly
            flex
            hideStepper
            label={lunas.remainPayment > 0 ?  "Sisa piutang" : "Masih ada kembalian sebesar"}
            value={lunas.remainPayment < 0 ? (-1 * lunas.remainPayment) : lunas.remainPayment}
            onChange={(e) => setLunas((o) => ({ ...o, remainPayment: e }))}
          />
        </Flex>
      </Flex>
      <Flex
        direction="row"
        gap="size-100"
        marginBottom={"size-100"}
        marginTop={"size-200"}
      >
        <View flex>
          <Button type={"submit"} variant="cta"
            isDisabled={isDescriptionValid === ""}>
            Save
          </Button>
          {children}
        </View>
        {lunas.id > 0 &&
        <View>
          <Button
            type={"button"}
            variant="negative"
            onPress={() => deletePelunasan()}
          >
            Delete
          </Button>
        </View>}
      </Flex>

    </Form>
  );

  async function deletePelunasan() {
    if (confirm("Data pelunasan akan dihapus dari database, anda yakin?\n\nSemua transaksi yang sudah dilunasi dalam pelunasan ini akan dikembalikan menjadi belum terlunasi.")) {
      const url = `${process.env.apiKey}/lunas/${lunas.id}`;
      const fetchOptions = {
        method: "DELETE",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      };
      const res = await fetch(url, fetchOptions);
      const json = await res.json();

      if (res.status === 200) {
        handleSubmit("DELETE", lunas.id);
      } else {
        console.log(data);
      }
    }
  };


  async function submitForm(e: FormEvent) {
    e.preventDefault();

    const url = `${process.env.apiKey}/lunas/${lunas.id}`;
    const fetchOptions = {
      method: lunas.id === 0 ? 'POST' : 'PUT',
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ data: lunas }),
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      handleSubmit(lunas.id === 0 ? 'POST' : 'PUT', json);
    } else {
      console.log(json.message);
    }
  }

};

export default PelunasanForm;
