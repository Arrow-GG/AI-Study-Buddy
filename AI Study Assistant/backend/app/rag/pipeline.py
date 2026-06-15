"""RAG (Retrieval-Augmented Generation) pipeline"""
import logging
from typing import List, Dict, Any, Optional
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma
from langchain.chat_models import ChatGoogleGenerativeAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain.callbacks import StdOutCallbackHandler
from app.config import settings

logger = logging.getLogger(__name__)

class RAGPipeline:
    """RAG pipeline for semantic search and question answering"""
    
    def __init__(self):
        """Initialize RAG components"""
        self.embeddings = HuggingFaceEmbeddings(model_name=settings.EMBEDDING_MODEL)
        self.vector_store = Chroma(
            persist_directory=settings.CHROMA_PERSIST_DIR,
            embedding_function=self.embeddings,
            collection_name="study_materials"
        )
        
        # Initialize LLM
        self.llm = ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL,
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.7
        )
        
        # Custom prompt template for better responses
        self.prompt_template = PromptTemplate(
            input_variables=["context", "question"],
            template="""Use the following context from study materials to answer the question.
If you cannot answer from the context, say so clearly.

Context:
{context}

Question: {question}

Answer:"""
        )
    
    async def query(
        self,
        question: str,
        document_id: Optional[str] = None,
        top_k: int = 3
    ) -> Dict[str, Any]:
        """
        Query documents using RAG
        
        Args:
            question: User's question
            document_id: Filter by specific document (optional)
            top_k: Number of top results to retrieve
        
        Returns:
            Dictionary with answer, sources, and confidence
        """
        try:
            # Retrieve relevant documents
            retriever = self.vector_store.as_retriever(search_kwargs={"k": top_k})
            
            # Create QA chain
            qa_chain = RetrievalQA.from_chain_type(
                llm=self.llm,
                chain_type="stuff",
                retriever=retriever,
                return_source_documents=True,
                callbacks=[StdOutCallbackHandler()]
            )
            
            # Execute query
            result = await qa_chain.arun(question)
            
            return {
                "response": result,
                "sources": [],  # Extract from source_documents
                "confidence": 0.85  # Placeholder
            }
        
        except Exception as e:
            logger.error(f"RAG query failed: {str(e)}")
            raise
    
    async def add_documents(
        self,
        texts: List[str],
        document_id: str,
        metadatas: Optional[List[Dict]] = None
    ) -> bool:
        """
        Add documents to vector store
        
        Args:
            texts: List of text chunks
            document_id: Document identifier
            metadatas: Optional metadata for each chunk
        
        Returns:
            Success status
        """
        try:
            if metadatas is None:
                metadatas = [{"document_id": document_id} for _ in texts]
            
            # Add to vector store
            self.vector_store.add_texts(texts=texts, metadatas=metadatas)
            self.vector_store.persist()
            
            logger.info(f"Added {len(texts)} chunks for document {document_id}")
            return True
        
        except Exception as e:
            logger.error(f"Failed to add documents: {str(e)}")
            return False
    
    async def search(
        self,
        query: str,
        top_k: int = 5,
        document_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Semantic search across documents
        
        Args:
            query: Search query
            top_k: Number of results
            document_id: Filter by document (optional)
        
        Returns:
            List of relevant documents with metadata
        """
        try:
            results = self.vector_store.similarity_search_with_score(query, k=top_k)
            
            formatted_results = [
                {
                    "content": doc.page_content,
                    "score": score,
                    "metadata": doc.metadata
                }
                for doc, score in results
            ]
            
            return formatted_results
        
        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            return []

# Global RAG instance
_rag_pipeline: Optional[RAGPipeline] = None

def get_rag_pipeline() -> RAGPipeline:
    """Get or create RAG pipeline instance"""
    global _rag_pipeline
    if _rag_pipeline is None:
        _rag_pipeline = RAGPipeline()
    return _rag_pipeline
