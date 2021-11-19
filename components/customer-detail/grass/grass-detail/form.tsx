import { NextPage } from "next";
import React, { FormEvent, useState } from "react";
import {
  iGrass,
  iGrassDetail,
  iProduct,
} from "@components/interfaces";
import { View } from "@react-spectrum/view";
import { Flex } from "@react-spectrum/layout";
import { Button } from "@react-spectrum/button";
import { Form } from "@react-spectrum/form";
import { Item } from "@react-spectrum/combobox";
import { NumberField } from "@react-spectrum/numberfield";
import { AsyncListData } from "@react-stately/data";
import { ComboBox } from "@adobe/react-spectrum";
//import { Text } from "@adobe/react-spectrum";
//import WaitMe from "@components/ui/wait-me";


export type GrassDetailFormProps = {
  data: iGrassDetail;
  updateDetail: (method: string, data: iGrassDetail) => void;
  closeForm: () => void;
};

const GrassDetailForm: NextPage<GrassDetailFormProps> = ({
  data,
  updateDetail,
  closeForm,
}) => {
  let [grassDetail, setGrassDetail] = React.useState<iGrassDetail>(
    {} as iGrassDetail
  );
  let [message, setMessage] = useState<string>("");
  //let [units, setUnits] = useState<iUnit[] | undefined>([]);

  React.useEffect(() => {
    let isLoaded = false;

    if (!isLoaded) {
      //console.log(data)
      setGrassDetail(data);
    }

    return () => {
      isLoaded = true;
    };
  }, [data]);

  async function postGrassDetail(method: string) {
    const url = `/api/grass-detail/${grassDetail.id}`;
    const fetchOptions = {
      method: method,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({ data: grassDetail }),
    };

    const res = await fetch(url, fetchOptions);
    const json = await res.json();

    if (res.status === 200) {
      updateDetail(method, {
        ...grassDetail,
        grassId: json.grassId,
        id: json.id,
        qty: json.qty
      });
      closeForm();
    } else {
      console.log(json.message);
      setMessage("Grass detail tidak bisa dipost, lihat log.");
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    postGrassDetail(grassDetail.id === 0 ? "POST" : "PUT");
  };

  const deleteGrassDetail = async () => {
    const url = `/api/grass-detail/${grassDetail.id}`;
    const fetchOptions = {
      method: "DELETE",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    };

    const res = await fetch(url, fetchOptions);
    const data: iGrass | any = await res.json();

    if (res.status === 200) {
      updateDetail("DELETE", grassDetail);
      closeForm();
    } else {
      console.log(data);
      setMessage(
        "Grass detail tidak dapat dihapus."
      );
    }
  };

  return (
    <View
      backgroundColor={"gray-75"}
      paddingY={"size-100"}
      paddingX={{ base: "size-100", M: "size-1000" }}
    >
      <Form onSubmit={handleSubmit}>
        <Flex direction={{ base: "column", M: "row" }} columnGap={"size-200"}>
          <NumberField
            labelPosition={"side"}
            hideStepper={true}
            autoFocus
            // onKeyUp={(e) => {
            //   //e.preventDefault();
            //   e.continuePropagation(); 
            //   (e.key === 'Enter') && postGrassDetail(grassDetail.id === 0 ? "POST" : "PUT");
            // }}
            width={"auto"}
            label={"Qty"}
            onChange={(e) => setGrassDetail((o) => ({ ...o, qty: e }))}
            value={grassDetail.qty}
          />
          <View flex>
            <Button variant="cta" onPress={(e) => postGrassDetail(grassDetail.id === 0 ? "POST" : "PUT")}>
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
          {grassDetail.id > 0 && (
            <View>
              <Button
                type={"button"}
                variant="negative"
                onPress={() => deleteGrassDetail()}
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

export default GrassDetailForm;
