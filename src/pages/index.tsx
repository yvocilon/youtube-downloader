import * as React from "react";
import { withTheme } from "emotion-theming";
import {
  List,
  ListIcon,
  ListItem,
  Textarea,
  Flex,
  Heading,
  FormControl,
  Button,
} from "@chakra-ui/core";

import useSWR from "swr";
import { Container } from "../components/Container";

const fetcher = (input, init?) => fetch(input, init).then((res) => res.json());

const Index = () => {
  const [files, setFiles] = React.useState("");

  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const { data: downloadableFiles = [], error, mutate } = useSWR(
    "/api/downloads",
    fetcher
  );

  async function downloadFiles(event: React.FormEvent) {
    event.preventDefault();

    setIsDownloading(true);
    setIsError(false);

    const response = await fetch("/api/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        links: files.split(" "),
      }),
    })
      .then((data) => data.json())
      .catch((err) => setIsError(true));

    setIsDownloading(false);

    mutate();
  }

  if (isDownloading) {
    return <h1>Downloading</h1>;
  }

  if (isError) {
    return <h1>error.. fuck</h1>;
  }

  return (
    <Container>
      <Flex
        flexDirection={"column"}
        justifyContent="center"
        alignItems="center"
        height="100vh"
      >
        <Heading fontSize="1.5rem">
          Voer alle download links in met een spatie ertussen.
        </Heading>
        <FormControl as="form" onSubmit={downloadFiles}>
          <Textarea
            value={files}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setFiles(event.currentTarget.value)
            }
          />
          <Button type="submit">Downloaden</Button>
        </FormControl>

        {downloadableFiles.length > 0 && (
          <List spacing={3}>
            {downloadableFiles.map((file) => (
              <ListItem>
                <ListIcon icon="check-circle" color="green.500" />
                <a download={true} href={`api/files/${file}`}>
                  {file}
                </a>
              </ListItem>
            ))}
          </List>
        )}
      </Flex>
    </Container>
  );
};
export default withTheme(Index);
