import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Box, Text, useColorModeValue, Link, useDisclosure } from "@chakra-ui/react";
import { Image } from "@chakra-ui/react";
import he from 'he'; // Import he for HTML entity decoding
import EnlargeImageModal from "src/components/Modal/EnlargeImageModal";

interface Props {
    children: React.ReactNode;
}

function MarkdownComponent({ children }: Props) {

    const bgColor = useColorModeValue("gray.100", "gray.900");
    const borderColor = useColorModeValue("gray.200", "gray.800");

    const {
        isOpen: isOpenEnlargeImage,
        onOpen: onOpenEnlargeImage,
        onClose: onCloseEnlargeImage,
    } = useDisclosure();

    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
                img: ({ src, alt, title }) => {
                    // Decode HTML entities in the image src
                    const decodedSrc = he.decode(src ?? '');
                    ////console.log("Decoded image src:", decodedSrc);
                    return (
                        <>
                            <Image
                                src={decodedSrc}
                                alt={alt}
                                title={title}
                                style={{
                                    borderRadius: "12px",
                                    width: "75%",
                                    height: "75%",
                                }}
                                cursor="pointer"
                                onClick={onOpenEnlargeImage}
                            />
                            <EnlargeImageModal
                                isOpen={isOpenEnlargeImage}
                                onClose={onCloseEnlargeImage}
                                src={decodedSrc}
                            />
                        </>
                    );
                },
                h1: ({ ...props }) => (
                    <Text
                        fontSize="2xl"
                        fontWeight="bold"
                        mt={4}
                        mb={2}
                        {...props}
                    />
                ),
                h2: ({ ...props }) => (
                    <Text
                        fontSize="xl"
                        fontWeight="semibold"
                        mt={4}
                        mb={2}
                        {...props}
                    />
                ),
                h3: ({ ...props }) => (
                    <Text
                        fontSize="lg"
                        fontWeight="medium"
                        mt={4}
                        mb={2}
                        {...props}
                    />
                ),
                p: ({ ...props }) => <Text {...props} mb={4} />,
                a: ({ ...props }) => <Link color="blue.500" textDecoration="underline" {...props} />,
                ol: ({ ...props }) => <Box as="ol" mt={3} pl={5} {...props} />,
                ul: ({ ...props }) => <Box as="ul" mt={3} pl={5} {...props} />,
                // li: ({ ...props }) => <Box as="li" mt={1} {...props} />,
                li: ({ ...props }) => (
                    <Box as="li" mt={1} {...props}>
                        <Text as="span" ml={-4} mr={2}>&#8729;</Text>
                        <Text as="span">{props.children}</Text>
                    </Box>
                ),
                blockquote: ({ ...props }) => (
                    <Box
                        as="blockquote"
                        borderLeft="4px solid"
                        borderColor={borderColor}
                        pl={4}
                        mt={4}
                        fontStyle="italic"
                        {...props}
                    />
                ),
                pre: ({ ...props }) => (
                    <Box
                        as="pre"
                        p={4}
                        mt={4}
                        borderRadius="md"
                        bg={bgColor}
                        whiteSpace={"pre-wrap"}
                        {...props}
                    />
                ),
                code: ({ ...props }) => (
                    <Box
                        as="code"
                        p={1}
                        borderRadius="sm"
                        bg={bgColor}
                        {...props}
                    />
                ),
                //inlineCode: ({ ...props }) => <Box as="code" p={1} borderRadius="sm" bg={bgColor} {...props} />,
                em: ({ ...props }) => (
                    <Text as="em" fontStyle="italic" {...props} />
                ),
                strong: ({ ...props }) => (
                    <Text as="strong" fontWeight="bold" {...props} />
                ),
                hr: ({ ...props }) => (
                    <Box
                        as="hr"
                        mt={6}
                        borderBottom="1px solid"
                        borderColor={borderColor}
                        {...props}
                    />
                ),
            }}
        >
            {children as string}
        </ReactMarkdown>
    );
}

export default MarkdownComponent;
