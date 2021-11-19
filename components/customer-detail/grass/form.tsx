import { NextPage } from "next";
import React, { FormEvent, useState } from "react";
import { dateOnly, iGrass } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { TextField } from "@react-spectrum/textfield";
import { NumberField } from "@react-spectrum/numberfield";

type GrassFormProps = {
  data: iGrass;
  updateGrass: (method: string, data: iGrass) => void;
  closeForm: () => void;
};

const GrassForm: NextPage<GrassFormProps> = ({
  data,
  updateGrass,
  closeForm,
}) => {
  let [grass, setGrass] = React.useState<iGrass>({} as iGrass);
  let [message, setMessage] = useState<string>('');

  React.useEffect(() => {
    let isLoaded = false;

    if (!isLoaded) {
      setGrass(data);
    }

    return () => {
      isLoaded = true;
    };
  }, [data]);


  async function postData(method: string) {
    const url = `/api/grass/${grass.id}`;
    const fetchOptions = {
      method: method,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ data: grass }),
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      updateGrass(grass.id === 0 ? 'POST' : 'PUT', json);
      closeForm();
    } else {
      console.log(json.message)
      setMessage('Data pembelian tidak bisa dipost, lihat log.')
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    postData(grass.id === 0 ? 'POST' : 'PUT');
  };


  const deleteData = async () => {
    const url = `/api/grass/${grass.id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const data: iGrass | any = await res.json();

    if (res.status === 200) {
      updateGrass('DELETE', grass)
      closeForm();
    } else {
      console.log(data);
      setMessage('Pembelian tidak dapat dihapus, ada pembayaran piutang terkait order ini.')
    }
  }

  return (<View backgroundColor={"gray-100"} paddingY={"size-100"} paddingX={{base: "size-100", M:"size-1000"}}>
    <Form onSubmit={handleSubmit}>
      <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
        <TextField
          autoFocus
          width={"auto"}
          flex
          //width={{ base: "auto", M: "67%" }}
          isRequired
          placeholder={"e.g. Pembelian rumpur laut"}
          label={"Keterangan"}
          value={grass.descriptions}
          onChange={(e) => setGrass((o) => ({ ...o, descriptions: e }))}
        />
        <TextField
          type={"date"}
          width={{ base: "auto", M: "35%" }}
          placeholder={"e.g. dd/mm/yyyy"}
          isRequired
          label={"Tanggal "}
          value={dateOnly(grass.orderDate)}
          onChange={(e) => setGrass((o) => ({ ...o, orderDate: e }))}
        />
      </Flex>
      {grass.id > 0 ? (
        <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
          <NumberField
            flex
            hideStepper={true}
            width={"auto"}
            label={"Bayar"}
            value={grass.price}
            onChange={(e) =>
              setGrass((o) => ({ ...o, price: e, total: o.qty * e }))
            } />
          <NumberField
            isReadOnly
            isDisabled
            flex
            hideStepper={true}
            width={"auto"}
            label={"Qty"}
            onChange={(e) => setGrass((o) => ({ ...o, qty: e }))}
            value={grass.qty} />

          <NumberField
            flex
            isReadOnly
            isDisabled
            hideStepper={true}
            width={"auto"}
            label={"Subtotal"}
            onChange={(e) => setGrass((o) => ({ ...o, total: e }))}
            value={grass.total} />
        </Flex>
      ) : <></>}
      <Flex direction="row" gap="size-100" marginBottom={"size-100"} marginTop={"size-200"}>
        <View flex>
          <Button type={"submit"} variant="cta">
            Save
          </Button>
          <Button
            type={"button"}
            variant="secondary"
            marginStart={"size-100"}
            onPress={() => closeForm()}
          >
            Cancel
          </Button>
        </View>
        {grass.id > 0 && (
          <View>
            <Button type={"button"} variant="negative"
              onPress={() => deleteData()}>
              Delete
            </Button>
          </View>
        )}
      </Flex>
    </Form>
  </View>
  );
};

export default GrassForm;
