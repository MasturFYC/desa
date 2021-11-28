import { NextPage } from "next";
import React, { FormEvent, useState } from "react";
import { dateOnly, iKasbon } from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { TextField } from "@react-spectrum/textfield";
import { NumberField } from "@react-spectrum/numberfield";

type KasbonFormProps = {
  data: iKasbon;
  updateKasbon: (method: string, data: iKasbon) => void;
  closeForm: () => void;
};

const KasbonForm: NextPage<KasbonFormProps> = ({
  data,
  updateKasbon,
  closeForm,
}) => {
  let [kasbon, setKasbon] = React.useState<iKasbon>({} as iKasbon);
  let [message, setMessage] = useState<string>("");

  const isDescriptionValid = React.useMemo(
    () => kasbon && kasbon.descriptions && kasbon.descriptions.length > 0,
    [kasbon.descriptions]
  )

  const isNominalValid = React.useMemo(
    () => kasbon && kasbon.total && kasbon.total > 0,
    [kasbon.total]
  )

  React.useEffect(() => {
    let isLoaded = false;

    if (!isLoaded) {
      setKasbon(data);
    }

    return () => {
      isLoaded = true;
    };
  }, [data]);

  async function postKasbon(method: string) {
    const url = `/api/kasbon/${kasbon.id}`;
    const fetchOptions = {
      method: method,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ data: kasbon }),
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      updateKasbon(kasbon.id === 0 ? "POST" : "PUT", json);
      closeForm();
    } else {
      console.log(json.message);
      setMessage("Data kasbon tidak bisa dipost, lihat log.");
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    postKasbon(kasbon.id === 0 ? "POST" : "PUT");
  };

  const deleteKasbon = async () => {
    const url = `/api/kasbon/${kasbon.id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const data: iKasbon | any = await res.json();

    if (res.status === 200) {
      updateKasbon("DELETE", kasbon);
      closeForm();
    } else {
      console.log(data);
      setMessage(
        "Kasbon tidak dapat dihapus, ada pembayaran piutang terkait order ini."
      );
    }
  };

  return (
    <View
      paddingY={"size-100"}
      paddingX={{ base: "size-100", M: "size-1000" }}
    >
      <Form onSubmit={handleSubmit}>
        <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
          <TextField
            autoFocus
            width={"auto"}
            validationState={isDescriptionValid ? "valid" : "invalid"}
            flex
            //width={{ base: "auto", M: "67%" }}
            isRequired
            placeholder={"e.g. Kasbon"}
            label={"Keterangan"}
            value={kasbon.descriptions}
            onChange={(e) => setKasbon((o) => ({ ...o, descriptions: e }))}
          />
          <TextField
            type={"date"}
            width={{ base: "auto", M: "20%" }}
            placeholder={"e.g. dd/mm/yyyy"}
            isRequired
            label={"Tanggal kasbon"}
            value={dateOnly(kasbon.kasbonDate)}
            onChange={(e) => setKasbon((o) => ({ ...o, kasbonDate: e }))}
          />
          <TextField
            type={"date"}
            width={{ base: "auto", M: "20%" }}
            placeholder={"e.g. dd/mm/yyyy"}
            isRequired
            label={"Jatuh tempo"}
            value={dateOnly(kasbon.jatuhTempo)}
            onChange={(e) => setKasbon((o) => ({ ...o, jatuhTempo: e }))}
          />
          <NumberField
            flex
            isRequired
            validationState={isNominalValid ? "valid" : "invalid"}
            hideStepper={true}
            width={{ base: "auto", M: "15%" }}
            label={"Total"}
            onChange={(e) => setKasbon((o) => ({ ...o, total: e }))}
            value={kasbon.total}
          />
        </Flex>
        <Flex
          direction="row"
          gap="size-100"
          marginBottom={"size-100"}
          marginTop={"size-200"}
        >
          <View flex>
            <Button type={"submit"} variant="cta"
            isDisabled={isNominalValid <= 0 || isDescriptionValid === ""}>
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
          {kasbon.id > 0 && (
            <View>
              <Button
                type={"button"}
                variant="negative"
                onPress={() => deleteKasbon()}
              >
                Delete
              </Button>
            </View>
          )}
        </Flex>
      </Form>
    </View>
  );
};

export default KasbonForm;
