import React, { useState, useEffect, useCallback } from 'react';
import { Box, Flex, Grid, Text, Heading, Spinner, Table, Asset } from '@contentful/f36-components';
import { HomeAppSDK } from '@contentful/app-sdk';
import { useSDK } from '@contentful/react-apps-toolkit';
import { SortIcon } from '@contentful/f36-icons';
import flatten from "flat";
import Stats from '../stats/Stats';
import Members from '../members/Members';
import tokens from '@contentful/f36-tokens';
import { useAsync } from 'react-async-hook';
import Recents from '../recents/Recents';

const Home = () => {
  const sdk = useSDK<HomeAppSDK>();
  const cma = sdk.cma;

  const [isDisplayLoader, setIsDisplayLoader] = useState(false);
  const [finalOutput, setFinalOutput] = useState<{ name: string, total: number }[] | []>([]);
  const [finalOutputassets, setFinalOutputassets] = useState<{ name: string, total: number }[] | []>([]);
  const [isDisplayTable, setisDisplaytable] = useState('');
  const [sorting, setSorting] = useState<any>({});
  const isDemo = false;

  const [data, setData] = useState<any>({
    total: null,
    published: null,
    scheduled: null,
    recent: null,
    totalAssets: null,
    totalTags: null,
  });

  useEffect(() => {

    async function fetchData() {
      const [total, published, scheduled, totalAssets, totalTags] = await Promise.all([
        cma.entry
          .getMany({})
          .then((entries) => entries.total || 0)
          .catch(() => 0),
        sdk.space
          .getPublishedEntries()
          .then((entries) => entries.total || 0)
          .catch(() => 0),
        cma.scheduledActions
          .getMany({ environmentId: sdk.ids.environmentAlias ?? sdk.ids.environment })
          .then((actions) => actions.items.length)
          .catch(() => 0),
        cma.asset
          .getMany({})
          .then((assets) => assets.total || 0)
          .catch(() => 0),
        cma.tag
          .getMany({})
          .then((tag) => tag.total || 0)
          .catch(() => 0),
        ,
      ]);
      setData({ ...data, total, published, scheduled, totalAssets, totalTags });
      const recent = await cma.entry
        .getMany({ query: { 'sys.updatedBy.sys.id': sdk.user.sys.id, limit: 3 } })
        .then((resp) => resp.items)
        .catch(() => []);
      setData({ total, published, scheduled, recent, totalAssets, totalTags });
    }
    fetchData();
  }, []);

  const getEntriesTable = async () => {
    setIsDisplayLoader(true);
    const entryList = await cma.contentType
      .getMany({})
      .then(async (entries) => {
        const promiseList: Promise<{ name: string; total: number; } | { name: string; total: number; }>[] = [];
        entries.items.forEach(element => {
          promiseList.push(
            cma.entry
              .getMany({ query: { 'content_type': element.sys.id, limit: 1 } })
              .then((entries) => { console.log("entriesentries >", entries); return { 'name': element.name, 'total': entries.total || 0 } })
              .catch(() => { return { 'name': element.name, 'total': 0 } })
          )
        });

        return await Promise.all([...promiseList])
      })
      .catch(() => { return [] })
    console.log("entryList >", entryList)
    setFinalOutput(entryList);
    setisDisplaytable('entries');
    setTimeout(() => {
      setIsDisplayLoader(false)
    }, 1000);
  };

  const getAssetsTable = async () => {
    setIsDisplayLoader(true);
    const finalOutputassets_ar: any = [];
    const assetsList = await cma.asset
      .getMany({})
      .then(async (entries) => {
        const promiseList: Promise<{ name: string; total: number; } | { name: string; total: number; }>[] = [];
        console.log(entries.items);
        const groupedObject = _.groupBy(entries.items, (item: any) => {
          var flatassest: any = flatten(item);
          return flatassest["fields.file.en-US.contentType"];
        });

        Object.keys(groupedObject).forEach((keyItem) => {
          //console.log('pankaj', keyItem);
          finalOutputassets_ar.push({
            'name': keyItem,
            'total': groupedObject[keyItem].length
          })
        });
        return await Promise.all([...promiseList])
      })
      .catch(() => { return [] })
    // console.log("assetsList >", finalOutputassets_ar)
    setFinalOutputassets(finalOutputassets_ar);
    setisDisplaytable('assets');
    setTimeout(() => {
      setIsDisplayLoader(false)
    }, 1000);
  };

  const handleSort = ({ column }: any) => {
    const direction =
      sorting && sorting?.column === column
        ? sorting.direction === "ascending"
          ? "descending"
          : "ascending"
        : "ascending";

    setFinalOutputassets((finalOutputassets_ar: any[]) => {
      const sorted = finalOutputassets_ar.sort((rowA, rowB) => {
        let a = rowA[column];
        const b = rowB[column];
        if (column === "name") {
          a = rowA[column] || "Untitled";
          return a.localeCompare(b);
        } else {
          return a - b;
        }

      });
      return direction === "ascending" ? sorted : sorted.reverse();
    });
    setSorting({ column, direction });
  };

  const handleSortEntry = ({ column }: any) => {
    const direction =
      sorting && sorting?.column === column
        ? sorting.direction === "ascending"
          ? "descending"
          : "ascending"
        : "ascending";

    setFinalOutput((entryList: any[]) => {
      const sorted = entryList.sort((rowA, rowB) => {
        let a = rowA[column];
        const b = rowB[column];
        if (column === "name") {
          a = rowA[column] || "Untitled";
          return a.localeCompare(b);
        } else {
          return a - b;
        }

      });
      return direction === "ascending" ? sorted : sorted.reverse();
    });
    setSorting({ column, direction });
  };

  const getTags = async () => {
    console.log('console tags');
    // setIsDisplayLoader(true);
    const finalOutputassets_ar: any = [];
    const assetsList = await cma.tag
      .getMany({})
      .then(async (tags) => {
        console.log("tags", tags)

      })
      .catch(() => { return [] })

  };

  return (
    <Flex flexDirection="column" alignItems="center" fullWidth>
      <Flex
        justifyContent="center"
        padding="spacingXl"
        fullWidth
        style={{ backgroundColor: tokens.gray700 }}>
        <Flex flexDirection="column" gap="spacingXl" style={{ width: '900px' }}>          
          <Text fontColor="colorWhite" fontSize="fontSize2Xl" fontWeight="fontWeightDemiBold">
            👋 Welcome back, {sdk.user.firstName} {sdk.user.lastName}!
          </Text>
        </Flex>
      </Flex>
      <Flex style={{ width: '900px' }} flexDirection="column" marginTop="spacing3Xl">
        <Stats />
        <Recents />
        {/* <Members /> */}
      </Flex>
    </Flex>
    // <Box margin="spacingXl">
    //   <Grid columns="1fr 1fr 1fr" columnGap="spacingM" rowGap="spacingM">
    //     <div onClick={() => { getEntriesTable() }} style={{ cursor: 'pointer' }}>
    //       <Collection label="Total entries" value={data.total} />
    //     </div>
    //     <div onClick={() => { getAssetsTable() }} style={{ cursor: 'pointer' }}>
    //       <Collection label="Total Assets" value={data.totalAssets} />
    //     </div>
    //     <div onClick={() => { getTags() }} style={{ cursor: 'pointer' }}>
    //       <Collection label="Total Tags" value={data.totalTags} />
    //     </div>

    //     <Collection label="Published entries" value={data.published} />
    //     <Collection label="Scheduled entries" value={data.scheduled} />
    //   </Grid>
    //   {isDisplayTable === 'entries' ?
    //     isDisplayLoader ? (
    //       <Flex>
    //         <Text marginRight="spacingXs">Loading</Text>
    //         <Spinner />
    //       </Flex>
    //     ) :
    //       <><br></br><Heading>All Entries Count</Heading><Table>
    //         <Table.Head>
    //           <Table.Row>
    //             <Table.Cell style={{ cursor: 'pointer' }} onClick={() => handleSortEntry({ column: "name" })}
    //               sortDirection={
    //                 sorting && sorting.column === "name"
    //                   ? sorting.direction
    //                   : false
    //               }>Content type <SortIcon /></Table.Cell>
    //             <Table.Cell style={{ cursor: 'pointer' }} onClick={() => handleSortEntry({ column: "total" })}
    //               sortDirection={
    //                 sorting && sorting.column === "total"
    //                   ? sorting.direction
    //                   : false
    //               }>Total Entries <SortIcon /></Table.Cell>
    //           </Table.Row>
    //         </Table.Head>
    //         <Table.Body>
    //           {finalOutput.map((item) => (
    //             <Table.Row>
    //               <Table.Cell>{item['name']}</Table.Cell>
    //               <Table.Cell>{item['total']}</Table.Cell>
    //             </Table.Row>
    //           ))}
    //         </Table.Body>
    //       </Table></>
    //     : null}
    //   {isDisplayTable === 'assets' ?
    //     isDisplayLoader ? (
    //       <LineWave color={"#062DF6"} height={200} width={200} />
    //     ) :
    //       <><br></br><Heading>All Assets Count</Heading>
    //         <Table>
    //           <Table.Head>
    //             <Table.Row>
    //               <Table.Cell style={{ cursor: 'pointer' }} onClick={() => handleSort({ column: "name" })}
    //                 sortDirection={
    //                   sorting && sorting.column === "name"
    //                     ? sorting.direction
    //                     : false
    //                 }>Assets type <SortIcon /></Table.Cell>
    //               <Table.Cell style={{ cursor: 'pointer' }} onClick={() => handleSort({ column: "total" })}
    //                 sortDirection={
    //                   sorting && sorting.column === "total"
    //                     ? sorting.direction
    //                     : false
    //                 }>Total Entries <SortIcon /></Table.Cell>
    //             </Table.Row>
    //           </Table.Head>
    //           <Table.Body>
    //             {isDemo ?
    //               <Table.Row key="demo">
    //                 <Table.Cell colSpan={2}>Comming Soon ...</Table.Cell>
    //               </Table.Row>
    //               :
    //               finalOutputassets.map((item, index) => (
    //                 <Table.Row key={index.toString()}>
    //                   <Table.Cell>{item['name']}</Table.Cell>
    //                   <Table.Cell>{item['total']}</Table.Cell>
    //                 </Table.Row>
    //               ))
    //             }
    //           </Table.Body>
    //         </Table></>
    //     : null}
    // </Box>

  );
};

export default Home;