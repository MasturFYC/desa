import dynamic from "next/dynamic";
import React, { FormEvent, Fragment, useEffect, useState } from "react";
import { useAsyncList } from "@react-stately/data";
import WaitMe from "@components/ui/wait-me";
import { NextPage } from "next";
import { Button } from '@react-spectrum/button';
import { dateParam, iLunas } from "@components/interfaces";
import { FormatDate } from "@lib/format";
import {
  DialogContainer,
  Dialog
} from "@react-spectrum/dialog";
import { Content, View } from "@react-spectrum/view";
import { Heading } from "@react-spectrum/text";
import { Divider } from "@react-spectrum/divider";

const CustomerTransaction = dynamic(() => import("@components/customer-detail/transaction"), {
  ssr: false,
});

const PelunasanForm = dynamic(() => import("./form"), {
  ssr: false,
});

const initLunas: iLunas = {
  id: 0,
  remainPayment: 0,
  customerId: 0,
  descriptions: '',
  updatedAt: dateParam(null),
  createdAt: dateParam(null)
};

type paymentProps = {
  customerId: number;
};

const PaymentPage: NextPage<paymentProps> = (props) => {
  let {customerId} = props;
  let [selectedData, setSelectedData] = useState<iLunas>({ ...initLunas, customerId: customerId });
  let [isOpen, setIsOpen] = useState<boolean>(false);
  let [newLunasId, setNewLunasId] = useState<number>(0);
  let [remainPayment, setRemainPayment] = useState<number>(0);
  //let [isPaymentLoaded, setIsPaymentLoaded] = useState<boolean>(true);

  let lunas = useAsyncList<iLunas>({
    async load({ signal }) {
      let res = await fetch(`/api/lunas/${customerId}`, { signal,
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        }
      });
      let json = await res.json();
      return { items: json };
    },
    getKey: (item: iLunas) => item.id,
  });

  // let payments = useAsyncList<iPayment>({
  //   async load({ signal }) {
  //     let res = await fetch(`/api/lunas/transactions`, {
  //       method: 'POST',
  //       signal,
  //       headers: {
  //         "Content-type": "application/json; charset=UTF-8",
  //       },
  //       body: JSON.stringify({ id: customerId, lunasId: 0 })
  //     });
  //     let json = await res.json();
  //     return { items: json };
  //   },
  //   getKey: (item: iPayment) => item.id,
  // });

  const handleSubmit = (method: string, e: iLunas | number) => {
    switch (method) {
      case "POST":
        {
          setNewLunasId(-1);
          let newData: iLunas = e as iLunas;
          lunas.append(newData);
          setNewLunasId(0);
        }
        break;
      case "PUT":
        {
          lunas.update(selectedData.id, e as iLunas);
        }
        break;
      case "DELETE":
        {
          
          setNewLunasId(-1);
          let idToRemove = e as number;
          lunas.remove(idToRemove);
          //setTimeout(() => {
            setNewLunasId(0);
          //}, 1000); 
        }
        break;
    }
    setIsOpen(false);
  };

  return (
    <Fragment>
      <DialogContainer
        type={"modal"}
        onDismiss={() => setIsOpen(false)}
        isDismissable
      >
        {isOpen && (
          <Dialog size="M">
            <Heading>
              Pelunasan
            </Heading>
            <Divider size="S" />
            <Content>
              <PelunasanForm data={selectedData} handleSubmit={handleSubmit}>
                <Button
                  type={"button"}
                  variant="secondary"
                  marginStart={"size-100"}
                  onPress={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
              </PelunasanForm>
            </Content>
          </Dialog>
        )}
      </DialogContainer>

      {lunas.isLoading && <WaitMe />}
      <View>
        {lunas && lunas.items.map((item, index) => (
          <ShowPelunasan key={index} item={item} setSelectedData={setSelectedData} setIsOpen={(e) => {
            setIsOpen(e)
          }} />
        ))}
      </View>
      <View>
        <Button
          variant={"cta"}
          onPress={() => {
            setIsOpen(o => true);
            setSelectedData({ ...initLunas, customerId: customerId, remainPayment: remainPayment });
          }}
          marginBottom={"size-100"}
        >
          Pelunasan Baru
        </Button>

      </View>
      {newLunasId === 0 && <View>
        <p><strong>Rincian Transaksi yang belum dilakukan pelunasan</strong></p>
        <CustomerTransaction customerId={customerId} lunasId={newLunasId}
         handlePiutang={(e) => {
           setRemainPayment(e);
         }}
        />
      </View>}
    </Fragment>
  );
}

type ShowPelunasanProps = {
  item: iLunas,
  setSelectedData: React.Dispatch<React.SetStateAction<iLunas>>,
  setIsOpen: (e: boolean) => void
}

function ShowPelunasan(props: ShowPelunasanProps): JSX.Element {
  let { item, setSelectedData, setIsOpen } = props;
  let [showLunas, setShowLunas] = useState<boolean>(false);

  return (<View>
    <View>
      <Button variant={"cta"}
        marginBottom={"size-100"}
        onPress={() => setShowLunas(!showLunas)}>
        Pelunasan #{item.id}
      </Button>
      {showLunas && item.id > 0 &&
        <Button variant={"primary"}
          marginStart={"size-100"}
          onPress={() => {
            setSelectedData(item);
            setIsOpen(true);
          }}>
          Edit
        </Button>
      }
    </View>
    {
      showLunas &&
      <CustomerTransaction customerId={item.customerId} lunasId={item.id} />
    }
  </View>)

}


type TableBodyProps = {
  item: iLunas;
  index: number;
  button: JSX.Element;
  children: JSX.Element
}

function TableBody(props: TableBodyProps): JSX.Element {
  let { item, index, button, children } = props;
  return (
    <>
      <tr>
        <td>{item.id}</td>
        <td>{FormatDate(item.createdAt)}</td>
        <td>{item.remainPayment}</td>
        <td>{item.descriptions}</td>
        <td>{button}</td>
      </tr>
      <tr>
        <td colSpan={5}>
          {children}
        </td>
      </tr>
    </>)
}

function TableHead(): JSX.Element {
  return (<thead>
    <tr>
      <th>ID#</th>
      <th>TANGGAL</th>
      <th>NO. PELUNASAN</th>
      <th>KETERANGAN</th>
      <th>Command</th>
    </tr>
  </thead>)
}

export default PaymentPage;
