const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createClient } = require('@supabase/supabase-js');
const getQuaryAnswer = require('./transcriptQuary');


const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "embedding-001" });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const transcript = async (req, res) => {
  try {
    // Validate environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase credentials not configured");
    }

    const { fullTranscript,problemId } = req.body;
    
    if (!fullTranscript || typeof fullTranscript !== 'string') {
      return res.status(400).json({ 
        error: "Invalid input",
        details: "fullTranscript must be a non-empty string" 
      });
    }

    // Process transcript
    const chunks = await createTextChunks(fullTranscript);
    const vectors = await generateEmbeddings(chunks);
    
    if (vectors.length === 0) {
      throw new Error("No embeddings generated");
    }

    const uploadResponse = await storeVectorsInSupabase(vectors,problemId);
    
    res.json({
      success: true,
      chunks: chunks.length,
      vectors: uploadResponse.length,
      firstId: uploadResponse[0]?.id
    });

  } catch (error) {
    console.error("Transcript processing failed:", error);
    res.status(500).json({ 
      error: "Processing failed",
      details: error.message 
    });
  }
};

async function createTextChunks(text) {
  const chunks = [];
  const words = text.split(/\s+/);
  const chunkSize = 100;
  
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunkWords = words.slice(i, i + chunkSize);
    let chunkText = chunkWords.join(' ');
    
    // Maintain sentence boundaries
    const lastPunctuation = Math.max(
      chunkText.lastIndexOf('. '),
      chunkText.lastIndexOf('? '),
      chunkText.lastIndexOf('! ')
    );
    
    if (lastPunctuation > -1 && i + chunkSize < words.length) {
      chunkText = chunkText.substring(0, lastPunctuation + 1);
      i -= (chunkWords.length - chunkText.split(/\s+/).length);
    }
    
    chunks.push({
      id: `chunk-${Date.now()}-${i}`,
      text: chunkText
    });
  }
  
  return chunks;
}

async function generateEmbeddings(chunks) {
  const vectors = [];
  
  for (const chunk of chunks) {
    try {
      const result = await model.embedContent(chunk.text);
      vectors.push({
        id: chunk.id,
        content: chunk.text.substring(0, 200),
        embedding: Array.from(result.embedding.values),
        metadata: {
          word_count: chunk.text.split(/\s+/).length,
          source: "tech_interview",
          created_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error(`Failed to embed chunk ${chunk.id}:`, error);
      continue;
    }
  }
  
  return vectors;
}
async function storeVectorsInSupabase(vectors, problemId) {
  try {
    // Validate inputs
    if (!problemId) throw new Error('problemId is required');
    if (!vectors || !Array.isArray(vectors)) throw new Error('vectors must be an array');

    // Process vectors to ensure problemId exists
    const processedVectors = vectors.map(vector => ({
      ...vector,
      problemId: vector.problemId || problemId
    }));

    // Verify the table structure first
    try {
      await supabase.rpc('verify_askme_table');
    } catch (err) {
      console.error('Table verification failed:', err);
      throw new Error('Table structure verification failed');
    }

    // Process in smaller batches
    const batchSize = 10;
    const results = [];
    
    for (let i = 0; i < processedVectors.length; i += batchSize) {
      const batch = processedVectors.slice(i, i + batchSize);
      
      // Debug: log first item of each batch
      console.log('Storing batch:', {
        batchIndex: i,
        firstItem: {
          id: batch[0].id,
          problemId: batch[0].problemId,
          contentLength: batch[0].content?.length
        }
      });

      const { data, error } = await supabase
        .from('askme')
        .upsert(batch)
        .select('id, problemId');

      if (error) {
        console.error('Batch error details:', {
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          batchIndex: i
        });
        throw error;
      }

      if (data) results.push(...data);
    }

    return results;
  } catch (error) {
    console.error('Vector storage failed:', {
      timestamp: new Date().toISOString(),
      problemId,
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack
      },
      sampleVector: vectors?.[0] ? {
        id: vectors[0].id,
        problemId: vectors[0].problemId,
        contentLength: vectors[0].content?.length
      } : null
    });
    throw new Error(`Database operation failed: ${error.message}`);
  }
}

// const videoQuery = async (req, res) => {
//   try {
//     const { query } = req.body;

//     // Validate input
//     if (!query || query.trim().length < 3) {
//       return res.status(400).json({ 
//         error: "Query must be at least 3 characters long" 
//       });
//     }
    
//     const queryEmbedding = await generateQueryEmbedding(query);


//     // Search for similar chunks
//     const { data: results, error } = await supabase.rpc('search_transcripts', {
//       query_embedding: queryEmbedding,
//       similarity_threshold: 0.7,
//       match_count: 5
//     });
    

//     if(results.length==0){
//       return  res.status(200).json({ content: "Search failed : This question is not from your vedio" });
//     }
    
//     let content = "";

//     for(let i = 0;i<results.length;i++){
//       content+=" "+results[i].content;
//     }


//     if (error) throw error;
//    const answer = await getQuaryAnswer(query,content);

   
//     res.json({
//       content: answer,
//     });

//   } catch (err) {
//     console.error("Search error:", err);
//     res.status(500).json({ error: "Search failed" });
//   }
// };
const videoQuery = async (req, res) => {
  try {
    const { query, problemId } = req.body;

    // Validate input
    if (!query || query.trim().length < 3) {
      return res.status(400).json({ 
        error: "Query must be at least 3 characters long" 
      });
    }
    
    if (!problemId) {
      return res.status(400).json({ 
        error: "problemId is required" 
      });
    }
    
    // Generate embedding for the query
    const queryEmbedding = await generateQueryEmbedding(query);

    // Search for matching chunks with the same problemId
    const { data: results, error } = await supabase
      .from('askme')
      .select('id, content, problemId')
      .eq('problemId', problemId)  // Filter by problemId
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;
    console.log(results)
    if (results.length === 0) {
      return res.status(200).json({ 
        content: "No matching content found for this problem" 
      });
    }

    // Combine all matching chunks
    const combinedContent = results.map(r => r.content).join(' ');

    // Generate answer from the matching chunks
    const answer = await getQuaryAnswer(query, combinedContent);
    console.log(answer);

    res.json({
      content: answer,
      matchingChunks: results.length
    });

  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ 
      error: "Search failed",
      details: err.message 
    });
  }
};
async function generateQueryEmbedding(query) {
  try {
    const result = await model.embedContent(query);
    return Array.from(result.embedding.values);
  } catch (error) {
    console.error("Failed to generate query embedding:", error);
    throw new Error("Embedding generation failed");
  }
}





module.exports = { transcript ,videoQuery};
