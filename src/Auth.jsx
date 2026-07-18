import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { Eye, EyeOff } from 'lucide-react';

export default function Auth({ c, dark }) {
  const [modo, setModo] = useState('login');
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 12, border: `1px solid ${c.surface2}`, background: c.surface2, color: c.text, fontSize: 15, marginBottom: 14, boxSizing: 'border-box' };
  const inputSenhaWrapStyle = { position: 'relative', marginBottom: 14, width: '100%', boxSizing: 'border-box' };
  const inputSenhaStyle = { ...inputStyle, marginBottom: 0, paddingRight: 44, outline: 'none' };
  const olhoBtnStyle = { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: c.muted, display: 'flex', alignItems: 'center', padding: 4 };

  const recuperarSenha = async () => {
    setErro('');
    setMensagem('');
    if (!email) {
      setErro('Digite seu e-mail no campo acima para recuperar a senha.');
      return;
    }
    setCarregando(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setMensagem('Enviamos um link de recuperação para o seu e-mail.');
    } catch (err) {
      setErro(err.message || 'Não foi possível enviar o e-mail de recuperação.');
    } finally {
      setCarregando(false);
    }
  };

  const submit = async () => {
    setErro('');
    setMensagem('');
    if (modo === 'cadastro' && (!nome || !sobrenome)) {
      setErro('Preencha nome e sobrenome.');
      return;
    }
    if (!email || !senha) {
      setErro('Preencha e-mail e senha.');
      return;
    }
    if (senha.length < 6) {
      setErro('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (modo === 'cadastro' && senha !== confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }
    setCarregando(true);
    try {
      if (modo === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            data: {
              nome: nome,
              sobrenome: sobrenome,
              nome_completo: `${nome} ${sobrenome}`
            }
          }
        });
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
        <div style={{ textAlign: 'center', marginTop: 16, marginBottom: 20, fontSize: 13, color: c.muted }}>
          {modo === 'login' ? (
            <>Não tem conta? <span onClick={() => { setModo('cadastro'); setErro(''); setMensagem(''); }} style={{ color: '#8B5CF6', cursor: 'pointer', fontWeight: 600 }}>Criar conta</span></>
          ) : (
            <>Já tem conta? <span onClick={() => { setModo('login'); setErro(''); setMensagem(''); }} style={{ color: '#8B5CF6', cursor: 'pointer', fontWeight: 600 }}>Entrar</span></>
          )}
        </div>

        {modo === 'cadastro' && (
          <>
            <input style={inputStyle} type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            <input style={inputStyle} type="text" placeholder="Sobrenome" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} />
          </>
        )}

        <input style={inputStyle} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />

        <div style={inputSenhaWrapStyle}>
          <input
            style={inputSenhaStyle}
            type={mostrarSenha ? 'text' : 'password'}
            placeholder="Senha (min. 6 caracteres)"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
          />
          <button type="button" onClick={() => setMostrarSenha((m) => !m)} style={olhoBtnStyle} aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}>
            {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {modo === 'cadastro' && (
          <div style={inputSenhaWrapStyle}>
            <input
              style={inputSenhaStyle}
              type={mostrarConfirmarSenha ? 'text' : 'password'}
              placeholder="Confirmar senha"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setMostrarConfirmarSenha((m) => !m)} style={olhoBtnStyle} aria-label={mostrarConfirmarSenha ? 'Ocultar senha' : 'Mostrar senha'}>
              {mostrarConfirmarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        )}

        {erro && <div style={{ color: '#F87171', fontSize: 13, marginBottom: 12 }}>{erro}</div>}
        {mensagem && <div style={{ color: '#34D399', fontSize: 13, marginBottom: 12 }}>{mensagem}</div>}

        <button
          onClick={submit}
          disabled={carregando}
          style={{ width: '100%', background: '#8B5CF6', border: 'none', borderRadius: 12, padding: '13px', color: '#fff', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}
        >
          {carregando ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Criar conta'}
        </button>

        {modo === 'login' && (
          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12.5, color: c.muted }}>
            <span onClick={recuperarSenha} style={{ color: '#8B5CF6', cursor: 'pointer' }}>Esqueci minha senha</span>
          </div>
        )}
      </div>
    </div>
  );
}
