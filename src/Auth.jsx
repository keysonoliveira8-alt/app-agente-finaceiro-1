import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Auth({ c, dark }) {
  const [modo, setModo] = useState('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${c.surface2}`, background: c.surface2, color: c.text, fontSize: 15, marginBottom: 12 };

  const submit = async () => {
    setErro('');
    setMensagem('');
    if (!email || !senha) {
      setErro('Preencha e-mail e senha.');
      return;
    }
    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    setCarregando(true);
    try {
      if (modo === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password: senha });
        if (error) throw error;
        setMensagem('Conta criada! Verifique seu e-mail para confirmar o cadastro antes de fazer login.');
      }
    } catch (err) {
      setErro(err.message || 'Algo deu errado. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380, background: c.surface, borderRadius: 20, padding: 28 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Agente Financeiro</div>
          <div style={{ fontSize: 13, color: c.muted, marginTop: 4 }}>
            {modo === 'login' ? 'Entre na sua conta' : 'Crie sua conta gratuita'}
          </div>
        </div>

        <input style={inputStyle} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={inputStyle} type="password" placeholder="Senha (mín. 6 caracteres)" value={senha} onChange={(e) => setSenha(e.target.value)} />

        {erro && <div style={{ color: '#F87171', fontSize: 13, marginBottom: 12 }}>{erro}</div>}
        {mensagem && <div style={{ color: '#34D399', fontSize: 13, marginBottom: 12 }}>{mensagem}</div>}

        <button
          onClick={submit}
          disabled={carregando}
          style={{ width: '100%', background: '#8B5CF6', border: 'none', borderRadius: 12, padding: '13px', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer', opacity: carregando ? 0.7 : 1 }}
        >
          {carregando ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: c.muted }}>
          {modo === 'login' ? (
            <>Não tem conta? <span onClick={() => { setModo('cadastro'); setErro(''); setMensagem(''); }} style={{ color: '#8B5CF6', cursor: 'pointer', fontWeight: 600 }}>Cadastre-se</span></>
          ) : (
            <>Já tem conta? <span onClick={() => { setModo('login'); setErro(''); setMensagem(''); }} style={{ color: '#8B5CF6', cursor: 'pointer', fontWeight: 600 }}>Entrar</span></>
          )}
        </div>
      </div>
    </div>
  );
}
