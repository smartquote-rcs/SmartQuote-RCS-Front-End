import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  FileText,
  Plus,
  User,
  Package,
  Calendar,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { useTranslation } from "react-i18next";

interface QuoteWebFormProps {
  onQuoteSubmitted?: (quote: any) => void;
  isPublic?: boolean; // Para formulário público (sem login)
}

interface QuoteFormData {
  // Dados do Cliente
  cliente: {
    nome: string;
    empresa: string;
    email: string;
    telefone: string;
    endereco: string;
    cidade: string;
    codigoPostal: string;
    pais: string;
  };
  
  // Dados da Cotação
  produto: string;
  categoria: string;
  descricaoDetalhada: string;
  quantidade: string;
  unidadeMedida: string;
  
  // Especificações Técnicas
  especificacoesTecnicas: string;
  qualidadeExigida: string;
  certificacoesNecessarias: string;
  
  // Prazos e Entrega
  prazoEntrega: string;
  localEntrega: string;
  tipoEntrega: string;
  
  // Orçamento e Pagamento
  orcamentoEstimado: string;
  moeda: string;
  condicoesPagamento: string;
  
  // Prioridade e Urgência
  prioridade: "low" | "medium" | "high";
  dataLimiteResposta: string;
  urgente: boolean;
  
  // Informações Adicionais
  observacoes: string;
  anexos: File[];
  
  // Fornecedor Preferencial (opcional)
  fornecedorPreferencial: string;
  motivoEscolhaFornecedor: string;
  
  // Dados de Validação
  aceitaTermos: boolean;
  aceitaOrcamentoAproximado: boolean;
  autorizaContato: boolean;
}

const categoriasProdutos = [
  { value: "eletronicos", label: "Eletrônicos e Tecnologia" },
  { value: "industrial", label: "Equipamentos Industriais" },
  { value: "construcao", label: "Materiais de Construção" },
  { value: "energia", label: "Energia e Sustentabilidade" },
  { value: "automotivo", label: "Automotivo" },
  { value: "saude", label: "Saúde e Equipamentos Médicos" },
  { value: "alimentacao", label: "Alimentação e Bebidas" },
  { value: "textil", label: "Têxtil e Vestuário" },
  { value: "quimicos", label: "Químicos e Farmacêuticos" },
  { value: "servicos", label: "Serviços Profissionais" },
  { value: "outros", label: "Outros" },
];

const unidadesMedida = [
  "unidade", "kg", "litro", "metro", "metro²", "metro³", 
  "tonelada", "caixa", "pacote", "conjunto", "lote"
];

const moedas = [
  { value: "EUR", label: "Euro (€)" },
  { value: "USD", label: "Dólar Americano ($)" },
  { value: "GBP", label: "Libra Esterlina (£)" },
  { value: "BRL", label: "Real Brasileiro (R$)" },
  { value: "AOA", label: "Kwanza Angolano (Kz)" },
];

export function QuoteWebForm({ onQuoteSubmitted, isPublic = false }: QuoteWebFormProps) {
  const { t } = useTranslation();
  const { addQuote, suppliers } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [formData, setFormData] = useState<QuoteFormData>({
    cliente: {
      nome: "",
      empresa: "",
      email: "",
      telefone: "",
      endereco: "",
      cidade: "",
      codigoPostal: "",
      pais: "Portugal",
    },
    produto: "",
    categoria: "",
    descricaoDetalhada: "",
    quantidade: "",
    unidadeMedida: "unidade",
    especificacoesTecnicas: "",
    qualidadeExigida: "",
    certificacoesNecessarias: "",
    prazoEntrega: "",
    localEntrega: "",
    tipoEntrega: "entrega_normal",
    orcamentoEstimado: "",
    moeda: "EUR",
    condicoesPagamento: "",
    prioridade: "medium",
    dataLimiteResposta: "",
    urgente: false,
    observacoes: "",
    anexos: [],
    fornecedorPreferencial: "",
    motivoEscolhaFornecedor: "",
    aceitaTermos: false,
    aceitaOrcamentoAproximado: false,
    autorizaContato: true,
  });

  // Definir data limite padrão (7 dias a partir de hoje)
  useEffect(() => {
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 7);
    setFormData(prev => ({
      ...prev,
      dataLimiteResposta: defaultDate.toISOString().split('T')[0]
    }));
  }, []);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        const parentObj = prev[parent as keyof QuoteFormData] as any;
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: value
          }
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const validateStep = (step: number): string[] => {
    const errors: string[] = [];

    switch (step) {
      case 1: // Dados do Cliente
        if (!formData.cliente.nome.trim()) errors.push("Nome do contato é obrigatório");
        if (!formData.cliente.empresa.trim()) errors.push("Nome da empresa é obrigatório");
        if (!formData.cliente.email.trim()) errors.push("Email é obrigatório");
        if (formData.cliente.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.cliente.email)) {
          errors.push("Email inválido");
        }
        if (!formData.cliente.telefone.trim()) errors.push("Telefone é obrigatório");
        break;

      case 2: // Produto e Especificações
        if (!formData.produto.trim()) errors.push("Nome do produto é obrigatório");
        if (!formData.categoria) errors.push("Categoria é obrigatória");
        if (!formData.descricaoDetalhada.trim()) errors.push("Descrição detalhada é obrigatória");
        if (!formData.quantidade.trim()) errors.push("Quantidade é obrigatória");
        break;

      case 3: // Prazos e Entrega
        if (!formData.prazoEntrega.trim()) errors.push("Prazo de entrega é obrigatório");
        if (!formData.localEntrega.trim()) errors.push("Local de entrega é obrigatório");
        if (!formData.dataLimiteResposta) errors.push("Data limite para resposta é obrigatória");
        break;

      case 4: // Validação Final
        if (!formData.aceitaTermos) errors.push("Deve aceitar os termos e condições");
        break;
    }

    return errors;
  };

  const nextStep = () => {
    const errors = validateStep(currentStep);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setValidationErrors([]);
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // Validar todos os passos
    const allErrors: string[] = [];
    for (let i = 1; i <= 4; i++) {
      allErrors.push(...validateStep(i));
    }

    if (allErrors.length > 0) {
      setValidationErrors(allErrors);
      return;
    }

    setIsSubmitting(true);
    setValidationErrors([]);

    try {
      // Criar objeto de cotação
      const novaColacao = {
        id: `RCS-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`,
        cliente: formData.cliente.empresa,
        contato: formData.cliente.nome,
        email: formData.cliente.email,
        telefone: formData.cliente.telefone,
        endereco: `${formData.cliente.endereco}, ${formData.cliente.cidade}, ${formData.cliente.codigoPostal}`,
        produto: formData.produto,
        categoria: formData.categoria,
        descricao: formData.descricaoDetalhada,
        quantidade: `${formData.quantidade} ${formData.unidadeMedida}`,
        especificacoes: formData.especificacoesTecnicas,
        qualidade: formData.qualidadeExigida,
        certificacoes: formData.certificacoesNecessarias,
        valor: formData.orcamentoEstimado ? `${formData.moeda} ${formData.orcamentoEstimado}` : "A definir",
        prazoEntrega: formData.prazoEntrega,
        localEntrega: formData.localEntrega,
        tipoEntrega: formData.tipoEntrega,
        condicoesPagamento: formData.condicoesPagamento,
        status: "pending_approval",
        prioridade: formData.prioridade,
        urgente: formData.urgente,
        dataRecebido: new Date().toISOString().split("T")[0],
        prazoResposta: formData.dataLimiteResposta,
        responsavel: isPublic ? "Sistema Web" : "Usuário Logado",
        fornecedorPreferencial: formData.fornecedorPreferencial,
        motivoFornecedor: formData.motivoEscolhaFornecedor,
        observacoes: formData.observacoes,
        origem: isPublic ? "formulario_publico" : "formulario_interno",
        criadoEm: new Date().toISOString(),
      };

      // Salvar cotação
      if (onQuoteSubmitted) {
        onQuoteSubmitted(novaColacao);
      }

      // Adicionar ao contexto se não for público
      if (!isPublic && addQuote) {
        addQuote({
          produto: novaColacao.produto,
          fornecedor: novaColacao.fornecedorPreferencial || "A definir",
          valor: novaColacao.valor,
          status: "pending",
          data: new Date().toLocaleDateString("pt-PT"),
        });
      }

      // Simular envio de email de confirmação
      console.log("📧 Enviando email de confirmação para:", formData.cliente.email);

      setSubmitStatus('success');
      
      // Resetar formulário após 3 segundos
      setTimeout(() => {
        resetForm();
        setIsOpen(false);
        setSubmitStatus('idle');
      }, 3000);

    } catch (error) {
      console.error("Erro ao submeter cotação:", error);
      setSubmitStatus('error');
      setValidationErrors(["Erro interno. Tente novamente mais tarde."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setValidationErrors([]);
    setFormData({
      cliente: {
        nome: "",
        empresa: "",
        email: "",
        telefone: "",
        endereco: "",
        cidade: "",
        codigoPostal: "",
        pais: "Portugal",
      },
      produto: "",
      categoria: "",
      descricaoDetalhada: "",
      quantidade: "",
      unidadeMedida: "unidade",
      especificacoesTecnicas: "",
      qualidadeExigida: "",
      certificacoesNecessarias: "",
      prazoEntrega: "",
      localEntrega: "",
      tipoEntrega: "entrega_normal",
      orcamentoEstimado: "",
      moeda: "EUR",
      condicoesPagamento: "",
      prioridade: "medium",
      dataLimiteResposta: "",
      urgente: false,
      observacoes: "",
      anexos: [],
      fornecedorPreferencial: "",
      motivoEscolhaFornecedor: "",
      aceitaTermos: false,
      aceitaOrcamentoAproximado: false,
      autorizaContato: true,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      anexos: [...prev.anexos, ...files].slice(0, 5) // Máximo 5 arquivos
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      anexos: prev.anexos.filter((_, i) => i !== index)
    }));
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-6">
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step <= currentStep
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-400"
              }`}
            >
              {step}
            </div>
            {step < 4 && (
              <div
                className={`w-8 h-1 ${
                  step < currentStep ? "bg-blue-600" : "bg-slate-700"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <User className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">Dados do Cliente</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cliente-nome" className="text-slate-300">Nome do Contato *</Label>
          <Input
            id="cliente-nome"
            value={formData.cliente.nome}
            onChange={(e) => updateFormData("cliente.nome", e.target.value)}
            placeholder="Seu nome completo"
            className="bg-slate-800/50 border-slate-600/50 text-white"
          />
        </div>
        
        <div>
          <Label htmlFor="cliente-empresa" className="text-slate-300">Empresa *</Label>
          <Input
            id="cliente-empresa"
            value={formData.cliente.empresa}
            onChange={(e) => updateFormData("cliente.empresa", e.target.value)}
            placeholder="Nome da empresa"
            className="bg-slate-800/50 border-slate-600/50 text-white"
          />
        </div>
        
        <div>
          <Label htmlFor="cliente-email" className="text-slate-300">Email *</Label>
          <Input
            id="cliente-email"
            type="email"
            value={formData.cliente.email}
            onChange={(e) => updateFormData("cliente.email", e.target.value)}
            placeholder="seu@email.com"
            className="bg-slate-800/50 border-slate-600/50 text-white"
          />
        </div>
        
        <div>
          <Label htmlFor="cliente-telefone" className="text-slate-300">Telefone *</Label>
          <Input
            id="cliente-telefone"
            value={formData.cliente.telefone}
            onChange={(e) => updateFormData("cliente.telefone", e.target.value)}
            placeholder="+351 912 345 678"
            className="bg-slate-800/50 border-slate-600/50 text-white"
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="cliente-endereco" className="text-slate-300">Endereço</Label>
          <Input
            id="cliente-endereco"
            value={formData.cliente.endereco}
            onChange={(e) => updateFormData("cliente.endereco", e.target.value)}
            placeholder="Rua, número, andar"
            className="bg-slate-800/50 border-slate-600/50 text-white"
          />
        </div>
        
        <div>
          <Label htmlFor="cliente-cidade" className="text-slate-300">Cidade</Label>
          <Input
            id="cliente-cidade"
            value={formData.cliente.cidade}
            onChange={(e) => updateFormData("cliente.cidade", e.target.value)}
            placeholder="Lisboa"
            className="bg-slate-800/50 border-slate-600/50 text-white"
          />
        </div>
        
        <div>
          <Label htmlFor="cliente-codigo-postal" className="text-slate-300">Código Postal</Label>
          <Input
            id="cliente-codigo-postal"
            value={formData.cliente.codigoPostal}
            onChange={(e) => updateFormData("cliente.codigoPostal", e.target.value)}
            placeholder="1000-001"
            className="bg-slate-800/50 border-slate-600/50 text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Package className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">Produto e Especificações</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="produto" className="text-slate-300">Nome do Produto *</Label>
          <Input
            id="produto"
            value={formData.produto}
            onChange={(e) => updateFormData("produto", e.target.value)}
            placeholder="Ex: Painéis Solares 400W"
            className="bg-slate-800/50 border-slate-600/50 text-white"
          />
        </div>
        
        <div>
          <Label htmlFor="categoria" className="text-slate-300">Categoria *</Label>
          <Select value={formData.categoria} onValueChange={(value) => updateFormData("categoria", value)}>
            <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {categoriasProdutos.map((cat) => (
                <SelectItem key={cat.value} value={cat.value} className="text-white hover:bg-slate-700">
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="quantidade" className="text-slate-300">Quantidade *</Label>
          <Input
            id="quantidade"
            value={formData.quantidade}
            onChange={(e) => updateFormData("quantidade", e.target.value)}
            placeholder="50"
            className="bg-slate-800/50 border-slate-600/50 text-white"
          />
        </div>
        
        <div>
          <Label htmlFor="unidade-medida" className="text-slate-300">Unidade de Medida</Label>
          <Select value={formData.unidadeMedida} onValueChange={(value) => updateFormData("unidadeMedida", value)}>
            <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {unidadesMedida.map((unidade) => (
                <SelectItem key={unidade} value={unidade} className="text-white hover:bg-slate-700">
                  {unidade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="descricao-detalhada" className="text-slate-300">Descrição Detalhada *</Label>
        <Textarea
          id="descricao-detalhada"
          value={formData.descricaoDetalhada}
          onChange={(e) => updateFormData("descricaoDetalhada", e.target.value)}
          placeholder="Descreva detalhadamente o produto ou serviço que precisa..."
          rows={4}
          className="bg-slate-800/50 border-slate-600/50 text-white"
        />
      </div>
      
      <div>
        <Label htmlFor="especificacoes-tecnicas" className="text-slate-300">Especificações Técnicas</Label>
        <Textarea
          id="especificacoes-tecnicas"
          value={formData.especificacoesTecnicas}
          onChange={(e) => updateFormData("especificacoesTecnicas", e.target.value)}
          placeholder="Dimensões, potência, materiais, normas técnicas..."
          rows={3}
          className="bg-slate-800/50 border-slate-600/50 text-white"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="qualidade-exigida" className="text-slate-300">Qualidade Exigida</Label>
          <Input
            id="qualidade-exigida"
            value={formData.qualidadeExigida}
            onChange={(e) => updateFormData("qualidadeExigida", e.target.value)}
            placeholder="Premium, Standard, Básica..."
            className="bg-slate-800/50 border-slate-600/50 text-white"
          />
        </div>
        
        <div>
          <Label htmlFor="certificacoes" className="text-slate-300">Certificações Necessárias</Label>
          <Input
            id="certificacoes"
            value={formData.certificacoesNecessarias}
            onChange={(e) => updateFormData("certificacoesNecessarias", e.target.value)}
            placeholder="CE, ISO, INMETRO..."
            className="bg-slate-800/50 border-slate-600/50 text-white"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Calendar className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">Prazos e Entrega</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="prazo-entrega" className="text-slate-300">Prazo de Entrega Desejado *</Label>
          <Input
            id="prazo-entrega"
            value={formData.prazoEntrega}
            onChange={(e) => updateFormData("prazoEntrega", e.target.value)}
            placeholder="Ex: 15 dias úteis"
            className="bg-slate-800/50 border-slate-600/50 text-white"
          />
        </div>
        
        <div>
          <Label htmlFor="data-limite" className="text-slate-300">Data Limite para Resposta *</Label>
          <Input
            id="data-limite"
            type="date"
            value={formData.dataLimiteResposta}
            onChange={(e) => updateFormData("dataLimiteResposta", e.target.value)}
            className="bg-slate-800/50 border-slate-600/50 text-white"
          />
        </div>
        
        <div className="md:col-span-2">
          <Label htmlFor="local-entrega" className="text-slate-300">Local de Entrega *</Label>
          <Input
            id="local-entrega"
            value={formData.localEntrega}
            onChange={(e) => updateFormData("localEntrega", e.target.value)}
            placeholder="Endereço completo para entrega"
            className="bg-slate-800/50 border-slate-600/50 text-white"
          />
        </div>
        
        <div>
          <Label htmlFor="tipo-entrega" className="text-slate-300">Tipo de Entrega</Label>
          <Select value={formData.tipoEntrega} onValueChange={(value) => updateFormData("tipoEntrega", value)}>
            <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="entrega_normal" className="text-white hover:bg-slate-700">Entrega Normal</SelectItem>
              <SelectItem value="entrega_expressa" className="text-white hover:bg-slate-700">Entrega Expressa</SelectItem>
              <SelectItem value="retirada_local" className="text-white hover:bg-slate-700">Retirada no Local</SelectItem>
              <SelectItem value="instalacao_local" className="text-white hover:bg-slate-700">Entrega e Instalação</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="prioridade" className="text-slate-300">Prioridade</Label>
          <Select value={formData.prioridade} onValueChange={(value: "low" | "medium" | "high") => updateFormData("prioridade", value)}>
            <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              <SelectItem value="low" className="text-white hover:bg-slate-700">🟢 Baixa</SelectItem>
              <SelectItem value="medium" className="text-white hover:bg-slate-700">🟡 Média</SelectItem>
              <SelectItem value="high" className="text-white hover:bg-slate-700">🔴 Alta</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="orcamento-estimado" className="text-slate-300">Orçamento Estimado</Label>
          <Input
            id="orcamento-estimado"
            value={formData.orcamentoEstimado}
            onChange={(e) => updateFormData("orcamentoEstimado", e.target.value)}
            placeholder="10000"
            className="bg-slate-800/50 border-slate-600/50 text-white"
          />
        </div>
        
        <div>
          <Label htmlFor="moeda" className="text-slate-300">Moeda</Label>
          <Select value={formData.moeda} onValueChange={(value) => updateFormData("moeda", value)}>
            <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600">
              {moedas.map((moeda) => (
                <SelectItem key={moeda.value} value={moeda.value} className="text-white hover:bg-slate-700">
                  {moeda.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="condicoes-pagamento" className="text-slate-300">Condições de Pagamento Preferenciais</Label>
        <Input
          id="condicoes-pagamento"
          value={formData.condicoesPagamento}
          onChange={(e) => updateFormData("condicoesPagamento", e.target.value)}
          placeholder="Ex: 30% antecipado, 70% na entrega"
          className="bg-slate-800/50 border-slate-600/50 text-white"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="urgente"
          checked={formData.urgente}
          onChange={(e) => updateFormData("urgente", e.target.checked)}
          className="w-4 h-4 text-red-600 bg-slate-800 border-slate-600 rounded focus:ring-red-500"
        />
        <Label htmlFor="urgente" className="text-slate-300 flex items-center space-x-1">
          <span>Solicitação Urgente</span>
          <AlertCircle className="w-4 h-4 text-red-400" />
        </Label>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <CheckCircle className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">Finalização e Confirmação</h3>
      </div>
      
      <div>
        <Label htmlFor="fornecedor-preferencial" className="text-slate-300">Fornecedor Preferencial (Opcional)</Label>
        <Select value={formData.fornecedorPreferencial} onValueChange={(value) => updateFormData("fornecedorPreferencial", value)}>
          <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-white">
            <SelectValue placeholder="Selecione um fornecedor (opcional)" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-600">
            <SelectItem value="" className="text-white hover:bg-slate-700">Sem preferência</SelectItem>
            {suppliers.map((supplier: any) => (
              <SelectItem key={supplier.id} value={supplier.nome} className="text-white hover:bg-slate-700">
                {supplier.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {formData.fornecedorPreferencial && (
        <div>
          <Label htmlFor="motivo-fornecedor" className="text-slate-300">Motivo da Escolha</Label>
          <Textarea
            id="motivo-fornecedor"
            value={formData.motivoEscolhaFornecedor}
            onChange={(e) => updateFormData("motivoEscolhaFornecedor", e.target.value)}
            placeholder="Por que prefere este fornecedor?"
            rows={2}
            className="bg-slate-800/50 border-slate-600/50 text-white"
          />
        </div>
      )}
      
      <div>
        <Label htmlFor="observacoes" className="text-slate-300">Observações Adicionais</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => updateFormData("observacoes", e.target.value)}
          placeholder="Informações adicionais, requisitos especiais, etc..."
          rows={3}
          className="bg-slate-800/50 border-slate-600/50 text-white"
        />
      </div>
      
      <div>
        <Label className="text-slate-300 mb-2 block">Anexos (Máximo 5 arquivos)</Label>
        <div className="space-y-2">
          <Input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="bg-slate-800/50 border-slate-600/50 text-white file:bg-blue-600 file:text-white file:border-none file:rounded file:px-3 file:py-1"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
          />
          
          {formData.anexos.length > 0 && (
            <div className="space-y-1">
              {formData.anexos.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-slate-800/30 rounded px-3 py-2">
                  <span className="text-slate-300 text-sm">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-3 pt-4 border-t border-slate-700">
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="aceita-termos"
            checked={formData.aceitaTermos}
            onChange={(e) => updateFormData("aceitaTermos", e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500 mt-1"
          />
          <Label htmlFor="aceita-termos" className="text-slate-300 text-sm">
            Aceito os termos e condições de uso e autorizo o processamento dos meus dados para fins de cotação *
          </Label>
        </div>
        
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="aceita-orcamento"
            checked={formData.aceitaOrcamentoAproximado}
            onChange={(e) => updateFormData("aceitaOrcamentoAproximado", e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500 mt-1"
          />
          <Label htmlFor="aceita-orcamento" className="text-slate-300 text-sm">
            Aceito receber orçamentos aproximados caso o produto exato não esteja disponível
          </Label>
        </div>
        
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            id="autoriza-contato"
            checked={formData.autorizaContato}
            onChange={(e) => updateFormData("autorizaContato", e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-slate-800 border-slate-600 rounded focus:ring-blue-500 mt-1"
          />
          <Label htmlFor="autoriza-contato" className="text-slate-300 text-sm">
            Autorizo contato por telefone e email para esclarecimentos sobre a cotação
          </Label>
        </div>
      </div>
    </div>
  );

  const renderSuccessMessage = () => (
    <div className="text-center py-8">
      <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">Cotação Enviada com Sucesso!</h3>
      <p className="text-slate-300 mb-4">
        Sua solicitação foi recebida e será processada em breve.
      </p>
      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-left">
        <h4 className="font-bold text-green-400 mb-2">Próximos passos:</h4>
        <ul className="text-slate-300 text-sm space-y-1">
          <li>• Você receberá um email de confirmação em breve</li>
          <li>• Nossa equipe analisará sua solicitação</li>
          <li>• Entraremos em contato em até 24 horas</li>
          <li>• ID da Cotação: RCS-{new Date().getFullYear()}-{String(Date.now()).slice(-4)}</li>
        </ul>
      </div>
    </div>
  );

  if (isPublic) {
    // Renderização para formulário público (página standalone)
    return (
      <Card className="max-w-4xl mx-auto bg-slate-900/95 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-white">
            <FileText className="w-6 h-6 text-blue-400" />
            <span>{t("quoteForm.title")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submitStatus === 'success' ? renderSuccessMessage() : (
            <>
              {renderStepIndicator()}
              
              {validationErrors.length > 0 && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 font-medium">Erros encontrados:</span>
                  </div>
                  <ul className="text-red-300 text-sm space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}

              <div className="flex justify-between pt-6 border-t border-slate-700">
                <Button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  {t("quoteForm.previous")}
                </Button>
                
                {currentStep < 4 ? (
                  <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {t("quoteForm.next")}
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isSubmitting ? t("quoteForm.submitting") : t("quoteForm.submit")}
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Renderização para modal interno
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nova Cotação Completa</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-white">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>{t("quoteForm.titleComplete")}</span>
          </DialogTitle>
        </DialogHeader>
        
        {submitStatus === 'success' ? renderSuccessMessage() : (
          <>
            {renderStepIndicator()}
            
            {validationErrors.length > 0 && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 font-medium">{t("quoteForm.errorsFound")}</span>
                </div>
                <ul className="text-red-300 text-sm space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            <div className="flex justify-between pt-6 border-t border-slate-700">
              <Button
                onClick={prevStep}
                disabled={currentStep === 1}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Anterior
              </Button>
              
              {currentStep < 4 ? (
                <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700 text-white">
                  Próximo
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? "Enviando..." : "Enviar Cotação"}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
