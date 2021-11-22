import { NextPage } from "next";
import React, { FormEvent, useState } from "react";
import { dateOnly, iSupplier, iStock } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { TextArea, TextField } from "@react-spectrum/textfield";
import { NumberField } from "@react-spectrum/numberfield";
import { useDialogContainer } from "@adobe/react-spectrum";

type StockFormProps = {
  data: iStock;
  updateData: (method: string, data: iStock) => void;
};

const StockForm: NextPage<StockFormProps> = ({
  data,
  updateData: updateStock,
}) => {
  let [stock, setStock] = React.useState<iStock>({} as iStock);
  let [message, setMessage] = useState<string>("");
  const dialog = useDialogContainer();

  React.useEffect(() => {
    let isLoaded = false;

    if (!isLoaded) {
      setStock(data);
    }

    return () => {
      isLoaded = true;
    };
  }, [data]);

  async function postStock(method: string) {
    const url = `/api/stock/${stock.id}`;
    const fetchOptions = {
      method: method,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ data: stock }),
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      updateStock(stock.id === 0 ? "POST" : "PUT", json);
      dialog.dismiss();
    } else {
      console.log(json.message);
      setMessage("Data stock tidak bisa dipost, lihat log.");
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    postStock(stock.id === 0 ? "POST" : "PUT");
  };

  const deleteStock = async () => {
    const url = `/api/stock/${stock.id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const data: iStock | any = await res.json();

    if (res.status === 200) {
      updateStock("DELETE", stock);
      dialog.dismiss();
    } else {
      console.log(data);
      setMessage(
        "Stock tidak dapat dihapus, ada pembayaran piutang terkait stock ini."
      );
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
        <TextField
          autoFocus
          width={"auto"}
          flex
          //width={{ base: "auto", M: "67%" }}
          isRequired
          placeholder={"e.g. x-0001"}
          label={"No. Faktur"}
          value={stock.stockNum}
          onChange={(e) => setStock((o) => ({ ...o, stockNum: e }))}
        />
        <TextField
          type={"date"}
          width={{ base: "auto", M: "35%" }}
          placeholder={"e.g. dd/mm/yyyy"}
          isRequired
          label={"Tanggal stock"}
          value={dateOnly(stock.stockDate)}
          onChange={(e) => setStock((o) => ({ ...o, stockDate: e }))}
        />
      </Flex>

      <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
        <NumberField
          flex
          isReadOnly
          isDisabled
          hideStepper={true}
          width={"auto"}
          label={"Total"}
          onChange={(e) => setStock((o) => ({ ...o, total: e }))}
          value={stock.total}
        />
        <NumberField
          flex
          isRequired
          hideStepper={true}
          width={"auto"}
          label={"Bayar"}
          onChange={(e) => setStock((o) => ({ ...o, 
            cash: e,
            remainPayment: o.total - o.payments - e
          }))}
          value={stock.cash}
        />
      </Flex>

      <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
        <NumberField
          flex
          isDisabled
          isReadOnly
          hideStepper={true}
          width={"auto"}
          label={"Angsuran"}
          value={stock.payments}
          onChange={(e) =>
            setStock((o) => ({
              ...o,
              payments: e
            }))
          }
        />
        <NumberField
          flex
          isReadOnly
          isDisabled
          hideStepper={true}
          width={"auto"}
          label={"Piutang"}
          onChange={(e) => setStock((o) => ({ ...o, remainPayment: e }))}
          value={stock.remainPayment}
        />
      </Flex>
      <TextArea
        width={"auto"}
        flex
        placeholder={"e.g. Pembelian Dari Supplier"}
        label={"Keterangan"}
        value={stock.descriptions}
        onChange={(e) => setStock((o) => ({ ...o, descriptions: e }))}
      />

      <Flex
        direction="row"
        gap="size-100"
        marginBottom={"size-100"}
        marginTop={"size-200"}
      >
        <View flex>
          <Button type={"submit"} variant="cta">
            Save
          </Button>
          <Button
            type={"button"}
            variant="secondary"
            marginStart={"size-100"}
            onPress={() => dialog.dismiss()}
          >
            Cancel
          </Button>
        </View>
        {stock.id > 0 && (
          <View>
            <Button
              type={"button"}
              variant="negative"
              onPress={() => deleteStock()}
            >
              Delete
            </Button>
          </View>
        )}
      </Flex>
    </Form>
  );
};

export default StockForm;
