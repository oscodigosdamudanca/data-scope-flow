/**
 * =====================================================
 * TESTES DE STORAGE E GERENCIAMENTO DE ARQUIVOS
 * =====================================================
 * 
 * Módulo dedicado para testar:
 * - Upload de arquivos
 * - Download de arquivos
 * - Listagem de arquivos
 * - Exclusão de arquivos
 * - Políticas de acesso a buckets
 * - Diferentes tipos de arquivo
 * - Limites de tamanho
 * - Metadados de arquivos
 */

import { createClient } from '@supabase/supabase-js';
import { TestLogger } from './supabase-comprehensive-test.js';

// =====================================================
// CLASSE PARA TESTES DE STORAGE
// =====================================================

class StorageTester {
  constructor(supabase, logger) {
    this.supabase = supabase;
    this.logger = logger;
    this.testBucket = 'test-files';
    this.uploadedFiles = [];
  }

  // Criar arquivo de teste em memória
  createTestFile(name, content, type = 'text/plain') {
    const blob = new Blob([content], { type });
    const file = new File([blob], name, { type });
    return file;
  }

  // Criar arquivo de imagem SVG de teste
  createTestSVG(name = 'test-image.svg') {
    const svgContent = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="blue"/>
        <text x="50" y="50" text-anchor="middle" fill="white">TEST</text>
      </svg>
    `;
    return this.createTestFile(name, svgContent, 'image/svg+xml');
  }

  // Verificar se bucket existe
  async checkBucketExists(bucketName) {
    this.logger.log('STORAGE', `Bucket Check - ${bucketName}`, 'INFO', `Verificando se bucket ${bucketName} existe...`);
    
    try {
      const { data, error } = await this.supabase.storage.listBuckets();

      if (error) {
        this.logger.log('STORAGE', `Bucket Check - ${bucketName}`, 'FAIL', 'Erro ao listar buckets', error.message);
        return false;
      }

      const bucketExists = data.some(bucket => bucket.name === bucketName);
      
      if (bucketExists) {
        this.logger.log('STORAGE', `Bucket Check - ${bucketName}`, 'PASS', 'Bucket encontrado');
      } else {
        this.logger.log('STORAGE', `Bucket Check - ${bucketName}`, 'FAIL', 'Bucket não encontrado');
      }

      return bucketExists;

    } catch (error) {
      this.logger.log('STORAGE', `Bucket Check - ${bucketName}`, 'FAIL', 'Exceção ao verificar bucket', error.message);
      return false;
    }
  }

  // Criar bucket de teste se não existir
  async createTestBucket() {
    this.logger.log('STORAGE', 'Create Bucket', 'INFO', `Criando bucket de teste ${this.testBucket}...`);
    
    try {
      const { data, error } = await this.supabase.storage.createBucket(this.testBucket, {
        public: false,
        allowedMimeTypes: ['image/*', 'text/*', 'application/pdf'],
        fileSizeLimit: 1024 * 1024 * 10 // 10MB
      });

      if (error) {
        // Se o bucket já existe, não é um erro
        if (error.message.includes('already exists')) {
          this.logger.log('STORAGE', 'Create Bucket', 'INFO', 'Bucket já existe');
          return true;
        } else {
          this.logger.log('STORAGE', 'Create Bucket', 'FAIL', 'Erro ao criar bucket', error.message);
          return false;
        }
      }

      this.logger.log('STORAGE', 'Create Bucket', 'PASS', 'Bucket criado com sucesso');
      return true;

    } catch (error) {
      this.logger.log('STORAGE', 'Create Bucket', 'FAIL', 'Exceção ao criar bucket', error.message);
      return false;
    }
  }

  // Testar upload de arquivo
  async testFileUpload() {
    this.logger.log('STORAGE', 'File Upload', 'INFO', 'Testando upload de arquivo...');
    
    try {
      // Garantir que o bucket existe
      const bucketExists = await this.checkBucketExists(this.testBucket);
      if (!bucketExists) {
        await this.createTestBucket();
      }

      // Criar arquivo de teste
      const testFile = this.createTestFile('test-document.txt', 'Este é um arquivo de teste para o DataScope');
      const fileName = `test-uploads/test-${Date.now()}.txt`;

      const { data, error } = await this.supabase.storage
        .from(this.testBucket)
        .upload(fileName, testFile);

      if (error) {
        this.logger.log('STORAGE', 'File Upload', 'FAIL', 'Erro no upload', error.message);
        return false;
      }

      if (data) {
        this.logger.log('STORAGE', 'File Upload', 'PASS', 'Arquivo enviado com sucesso', {
          path: data.path,
          fullPath: data.fullPath
        });
        
        this.uploadedFiles.push(fileName);
        return true;
      } else {
        this.logger.log('STORAGE', 'File Upload', 'FAIL', 'Upload não retornou dados');
        return false;
      }

    } catch (error) {
      this.logger.log('STORAGE', 'File Upload', 'FAIL', 'Exceção durante upload', error.message);
      return false;
    }
  }

  // Testar upload de imagem
  async testImageUpload() {
    this.logger.log('STORAGE', 'Image Upload', 'INFO', 'Testando upload de imagem...');
    
    try {
      const testImage = this.createTestSVG(`test-image-${Date.now()}.svg`);
      const fileName = `test-images/image-${Date.now()}.svg`;

      const { data, error } = await this.supabase.storage
        .from(this.testBucket)
        .upload(fileName, testImage);

      if (error) {
        this.logger.log('STORAGE', 'Image Upload', 'FAIL', 'Erro no upload de imagem', error.message);
        return false;
      }

      if (data) {
        this.logger.log('STORAGE', 'Image Upload', 'PASS', 'Imagem enviada com sucesso', {
          path: data.path,
          size: testImage.size
        });
        
        this.uploadedFiles.push(fileName);
        return true;
      } else {
        this.logger.log('STORAGE', 'Image Upload', 'FAIL', 'Upload de imagem não retornou dados');
        return false;
      }

    } catch (error) {
      this.logger.log('STORAGE', 'Image Upload', 'FAIL', 'Exceção durante upload de imagem', error.message);
      return false;
    }
  }

  // Testar listagem de arquivos
  async testFileList() {
    this.logger.log('STORAGE', 'File List', 'INFO', 'Testando listagem de arquivos...');
    
    try {
      const { data, error } = await this.supabase.storage
        .from(this.testBucket)
        .list('test-uploads', {
          limit: 10,
          offset: 0
        });

      if (error) {
        this.logger.log('STORAGE', 'File List', 'FAIL', 'Erro ao listar arquivos', error.message);
        return false;
      }

      if (data) {
        this.logger.log('STORAGE', 'File List', 'PASS', `${data.length} arquivo(s) encontrado(s)`, 
          data.map(file => ({ name: file.name, size: file.metadata?.size, updated: file.updated_at })));
        return true;
      } else {
        this.logger.log('STORAGE', 'File List', 'FAIL', 'Listagem não retornou dados');
        return false;
      }

    } catch (error) {
      this.logger.log('STORAGE', 'File List', 'FAIL', 'Exceção durante listagem', error.message);
      return false;
    }
  }

  // Testar download de arquivo
  async testFileDownload() {
    this.logger.log('STORAGE', 'File Download', 'INFO', 'Testando download de arquivo...');
    
    try {
      if (this.uploadedFiles.length === 0) {
        this.logger.log('STORAGE', 'File Download', 'SKIP', 'Nenhum arquivo para download');
        return false;
      }

      const fileName = this.uploadedFiles[0];
      
      const { data, error } = await this.supabase.storage
        .from(this.testBucket)
        .download(fileName);

      if (error) {
        this.logger.log('STORAGE', 'File Download', 'FAIL', 'Erro no download', error.message);
        return false;
      }

      if (data) {
        this.logger.log('STORAGE', 'File Download', 'PASS', 'Arquivo baixado com sucesso', {
          size: data.size,
          type: data.type
        });
        return true;
      } else {
        this.logger.log('STORAGE', 'File Download', 'FAIL', 'Download não retornou dados');
        return false;
      }

    } catch (error) {
      this.logger.log('STORAGE', 'File Download', 'FAIL', 'Exceção durante download', error.message);
      return false;
    }
  }

  // Testar geração de URL pública
  async testPublicURL() {
    this.logger.log('STORAGE', 'Public URL', 'INFO', 'Testando geração de URL pública...');
    
    try {
      if (this.uploadedFiles.length === 0) {
        this.logger.log('STORAGE', 'Public URL', 'SKIP', 'Nenhum arquivo para gerar URL');
        return false;
      }

      const fileName = this.uploadedFiles[0];
      
      const { data } = this.supabase.storage
        .from(this.testBucket)
        .getPublicUrl(fileName);

      if (data && data.publicUrl) {
        this.logger.log('STORAGE', 'Public URL', 'PASS', 'URL pública gerada', {
          url: data.publicUrl
        });
        return true;
      } else {
        this.logger.log('STORAGE', 'Public URL', 'FAIL', 'Não foi possível gerar URL pública');
        return false;
      }

    } catch (error) {
      this.logger.log('STORAGE', 'Public URL', 'FAIL', 'Exceção ao gerar URL pública', error.message);
      return false;
    }
  }

  // Testar geração de URL assinada (temporária)
  async testSignedURL() {
    this.logger.log('STORAGE', 'Signed URL', 'INFO', 'Testando geração de URL assinada...');
    
    try {
      if (this.uploadedFiles.length === 0) {
        this.logger.log('STORAGE', 'Signed URL', 'SKIP', 'Nenhum arquivo para gerar URL assinada');
        return false;
      }

      const fileName = this.uploadedFiles[0];
      
      const { data, error } = await this.supabase.storage
        .from(this.testBucket)
        .createSignedUrl(fileName, 3600); // 1 hora

      if (error) {
        this.logger.log('STORAGE', 'Signed URL', 'FAIL', 'Erro ao gerar URL assinada', error.message);
        return false;
      }

      if (data && data.signedUrl) {
        this.logger.log('STORAGE', 'Signed URL', 'PASS', 'URL assinada gerada', {
          url: data.signedUrl.substring(0, 100) + '...',
          expiresIn: '1 hora'
        });
        return true;
      } else {
        this.logger.log('STORAGE', 'Signed URL', 'FAIL', 'Não foi possível gerar URL assinada');
        return false;
      }

    } catch (error) {
      this.logger.log('STORAGE', 'Signed URL', 'FAIL', 'Exceção ao gerar URL assinada', error.message);
      return false;
    }
  }

  // Testar atualização de arquivo (substituição)
  async testFileUpdate() {
    this.logger.log('STORAGE', 'File Update', 'INFO', 'Testando atualização de arquivo...');
    
    try {
      if (this.uploadedFiles.length === 0) {
        this.logger.log('STORAGE', 'File Update', 'SKIP', 'Nenhum arquivo para atualizar');
        return false;
      }

      const fileName = this.uploadedFiles[0];
      const updatedFile = this.createTestFile('updated-document.txt', 'Este é o conteúdo atualizado do arquivo');

      const { data, error } = await this.supabase.storage
        .from(this.testBucket)
        .update(fileName, updatedFile);

      if (error) {
        this.logger.log('STORAGE', 'File Update', 'FAIL', 'Erro na atualização', error.message);
        return false;
      }

      if (data) {
        this.logger.log('STORAGE', 'File Update', 'PASS', 'Arquivo atualizado com sucesso', {
          path: data.path
        });
        return true;
      } else {
        this.logger.log('STORAGE', 'File Update', 'FAIL', 'Atualização não retornou dados');
        return false;
      }

    } catch (error) {
      this.logger.log('STORAGE', 'File Update', 'FAIL', 'Exceção durante atualização', error.message);
      return false;
    }
  }

  // Testar exclusão de arquivo
  async testFileDelete() {
    this.logger.log('STORAGE', 'File Delete', 'INFO', 'Testando exclusão de arquivo...');
    
    try {
      if (this.uploadedFiles.length === 0) {
        this.logger.log('STORAGE', 'File Delete', 'SKIP', 'Nenhum arquivo para excluir');
        return false;
      }

      const fileName = this.uploadedFiles[0];
      
      const { data, error } = await this.supabase.storage
        .from(this.testBucket)
        .remove([fileName]);

      if (error) {
        this.logger.log('STORAGE', 'File Delete', 'FAIL', 'Erro na exclusão', error.message);
        return false;
      }

      if (data && data.length > 0) {
        this.logger.log('STORAGE', 'File Delete', 'PASS', 'Arquivo excluído com sucesso', {
          deletedFiles: data.length
        });
        
        // Remover da lista de arquivos enviados
        this.uploadedFiles = this.uploadedFiles.filter(f => f !== fileName);
        return true;
      } else {
        this.logger.log('STORAGE', 'File Delete', 'FAIL', 'Exclusão não retornou confirmação');
        return false;
      }

    } catch (error) {
      this.logger.log('STORAGE', 'File Delete', 'FAIL', 'Exceção durante exclusão', error.message);
      return false;
    }
  }

  // Testar upload de arquivo muito grande (teste de limite)
  async testLargeFileUpload() {
    this.logger.log('STORAGE', 'Large File Upload', 'INFO', 'Testando upload de arquivo grande...');
    
    try {
      // Criar arquivo de 5MB (pode ser rejeitado dependendo das configurações)
      const largeContent = 'A'.repeat(5 * 1024 * 1024); // 5MB
      const largeFile = this.createTestFile('large-file.txt', largeContent);
      const fileName = `test-uploads/large-${Date.now()}.txt`;

      const { data, error } = await this.supabase.storage
        .from(this.testBucket)
        .upload(fileName, largeFile);

      if (error) {
        if (error.message.includes('size') || error.message.includes('limit')) {
          this.logger.log('STORAGE', 'Large File Upload', 'PASS', 'Arquivo grande rejeitado corretamente', error.message);
          return true;
        } else {
          this.logger.log('STORAGE', 'Large File Upload', 'FAIL', 'Erro inesperado no upload', error.message);
          return false;
        }
      }

      if (data) {
        this.logger.log('STORAGE', 'Large File Upload', 'INFO', 'Arquivo grande aceito', {
          path: data.path,
          size: `${(largeFile.size / 1024 / 1024).toFixed(2)}MB`
        });
        
        this.uploadedFiles.push(fileName);
        return true;
      }

    } catch (error) {
      this.logger.log('STORAGE', 'Large File Upload', 'FAIL', 'Exceção durante upload de arquivo grande', error.message);
      return false;
    }
  }

  // Testar upload de tipo de arquivo não permitido
  async testInvalidFileType() {
    this.logger.log('STORAGE', 'Invalid File Type', 'INFO', 'Testando upload de tipo não permitido...');
    
    try {
      // Criar arquivo executável (geralmente não permitido)
      const execFile = this.createTestFile('malicious.exe', 'fake executable content', 'application/x-executable');
      const fileName = `test-uploads/malicious-${Date.now()}.exe`;

      const { data, error } = await this.supabase.storage
        .from(this.testBucket)
        .upload(fileName, execFile);

      if (error) {
        if (error.message.includes('type') || error.message.includes('mime') || error.message.includes('allowed')) {
          this.logger.log('STORAGE', 'Invalid File Type', 'PASS', 'Tipo de arquivo rejeitado corretamente', error.message);
          return true;
        } else {
          this.logger.log('STORAGE', 'Invalid File Type', 'FAIL', 'Erro inesperado', error.message);
          return false;
        }
      }

      if (data) {
        this.logger.log('STORAGE', 'Invalid File Type', 'FAIL', 'Tipo de arquivo inválido foi aceito');
        this.uploadedFiles.push(fileName);
        return false;
      }

    } catch (error) {
      this.logger.log('STORAGE', 'Invalid File Type', 'PASS', 'Exceção esperada para tipo inválido');
      return true;
    }
  }

  // Limpar arquivos de teste
  async cleanupTestFiles() {
    this.logger.log('STORAGE', 'Cleanup', 'INFO', 'Limpando arquivos de teste...');
    
    try {
      if (this.uploadedFiles.length === 0) {
        this.logger.log('STORAGE', 'Cleanup', 'INFO', 'Nenhum arquivo para limpar');
        return true;
      }

      const { data, error } = await this.supabase.storage
        .from(this.testBucket)
        .remove(this.uploadedFiles);

      if (error) {
        this.logger.log('STORAGE', 'Cleanup', 'FAIL', 'Erro na limpeza', error.message);
        return false;
      }

      this.logger.log('STORAGE', 'Cleanup', 'PASS', 
        `${this.uploadedFiles.length} arquivo(s) de teste removido(s)`);
      
      this.uploadedFiles = [];
      return true;

    } catch (error) {
      this.logger.log('STORAGE', 'Cleanup', 'FAIL', 'Exceção durante limpeza', error.message);
      return false;
    }
  }

  // Executar todos os testes de storage
  async runAllStorageTests() {
    this.logger.log('STORAGE', 'Início Geral', 'INFO', 'Iniciando todos os testes de storage...');
    
    const results = {};
    
    // Verificações iniciais
    results.bucketExists = await this.checkBucketExists(this.testBucket);
    if (!results.bucketExists) {
      results.bucketCreation = await this.createTestBucket();
    }
    
    // Testes de upload
    results.fileUpload = await this.testFileUpload();
    results.imageUpload = await this.testImageUpload();
    
    // Testes de acesso
    results.fileList = await this.testFileList();
    results.fileDownload = await this.testFileDownload();
    results.publicURL = await this.testPublicURL();
    results.signedURL = await this.testSignedURL();
    
    // Testes de modificação
    results.fileUpdate = await this.testFileUpdate();
    
    // Testes de validação
    results.largeFileUpload = await this.testLargeFileUpload();
    results.invalidFileType = await this.testInvalidFileType();
    
    // Testes de exclusão
    results.fileDelete = await this.testFileDelete();
    
    // Limpeza
    await this.cleanupTestFiles();
    
    this.logger.log('STORAGE', 'Conclusão Geral', 'INFO', 'Todos os testes de storage concluídos');
    
    return results;
  }
}

export { StorageTester };