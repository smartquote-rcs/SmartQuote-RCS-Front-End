import React, { useState } from 'react';
import { produtoService, NovoProduto } from '../services/produtoService';

interface Props {
  fornecedorIdDefault?: number;
  onSucesso?: (p: any) => void;
}

const ProdutoForm: React.FC<Props> = ({ fornecedorIdDefault = 1, onSucesso }) => {
  const [form, setForm] = useState<NovoProduto>({
    fornecedor_id: fornecedorIdDefault,
    nome: '',
    preco: 0,
    estoque: 0,
    descricao: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'preco' || name === 'estoque' ? Number(value) : value }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null); setOkMsg(null); setLoading(true);
    try {
      let image_url: string | undefined = undefined;
      if (file) {
        image_url = await produtoService.uploadImagem(file);
      }
      const payload: NovoProduto = { ...form, image_url };
      const resp = await produtoService.criarProduto(payload);
      setOkMsg('Produto criado com sucesso');
      if (onSucesso) onSucesso(resp.data || resp);
      // reset básico
      setForm(f => ({ ...f, nome: '', preco: 0, estoque: 0, descricao: '' }));
      setFile(null); setPreview(null);
    } catch (err: any) {
      setErro(err.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-white max-w-md">
      <h2 className="text-lg font-semibold">Novo Produto</h2>
      {erro && <div className="text-red-600 text-sm">{erro}</div>}
      {okMsg && <div className="text-green-600 text-sm">{okMsg}</div>}
      <div>
        <label className="block text-sm font-medium">Nome</label>
        <input name="nome" value={form.nome} onChange={handleChange} className="w-full border px-2 py-1 rounded" required />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium">Preço (número)</label>
          <input type="number" name="preco" value={form.preco} onChange={handleChange} className="w-full border px-2 py-1 rounded" min={0} />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium">Estoque</label>
          <input type="number" name="estoque" value={form.estoque} onChange={handleChange} className="w-full border px-2 py-1 rounded" min={0} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Descrição</label>
        <textarea name="descricao" value={form.descricao} onChange={handleChange} className="w-full border px-2 py-1 rounded" rows={3} />
      </div>
      <div>
        <label className="block text-sm font-medium">Imagem</label>
        <input type="file" accept="image/*" onChange={handleFile} />
        {preview && <img src={preview} alt="preview" className="mt-2 h-24 object-contain border" />}
      </div>
      <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
        {loading ? 'Salvando...' : 'Salvar Produto'}
      </button>
    </form>
  );
};

export default ProdutoForm;
